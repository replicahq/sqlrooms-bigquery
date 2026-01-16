import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { z } from 'zod';

/**
 * Custom error class for BigQuery-related errors
 */
export class BigQueryError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'BigQueryError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Error class for authorization failures
 */
export class AuthorizationError extends BigQueryError {
  constructor(message: string = 'Query not authorized') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Error class for validation failures
 */
export class ValidationError extends BigQueryError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Express error handler for BigQuery routes
 */
export const bigQueryErrorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[BigQuery Error]', err);

  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: 'Invalid request body',
      code: 'VALIDATION_ERROR',
      details: err.errors,
    });
    return;
  }

  // Handle our custom errors
  if (err instanceof BigQueryError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  // Handle BigQuery API errors
  if (err.name === 'Error' && 'code' in err) {
    const bqErr = err as Error & { code?: number; errors?: unknown[] };
    const statusCode = bqErr.code === 404 ? 404 : bqErr.code === 403 ? 403 : 500;
    res.status(statusCode).json({
      error: err.message,
      code: 'BIGQUERY_ERROR',
      details: bqErr.errors,
    });
    return;
  }

  // Generic error
  res.status(500).json({
    error: err.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};

/**
 * Type for query authorization function
 */
export type AuthorizeQueryFn = (
  sql: string,
  params?: Record<string, unknown>,
  req?: Request
) => boolean | Promise<boolean>;

/**
 * Default authorization function that allows all queries
 */
export const defaultAuthorizeQuery: AuthorizeQueryFn = () => true;

/**
 * Create an authorization function that blocks dangerous SQL keywords
 */
export function createSafeQueryAuthorizer(
  blockedKeywords: string[] = ['DELETE', 'DROP', 'TRUNCATE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE']
): AuthorizeQueryFn {
  return (sql: string) => {
    const upperSql = sql.toUpperCase();
    return !blockedKeywords.some((keyword) =>
      upperSql.includes(keyword)
    );
  };
}
