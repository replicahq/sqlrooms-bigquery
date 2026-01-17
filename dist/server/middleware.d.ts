import type { Request, ErrorRequestHandler } from 'express';
/**
 * Custom error class for BigQuery-related errors
 */
export declare class BigQueryError extends Error {
    statusCode: number;
    code?: string;
    details?: unknown;
    constructor(message: string, statusCode?: number, code?: string, details?: unknown);
}
/**
 * Error class for authorization failures
 */
export declare class AuthorizationError extends BigQueryError {
    constructor(message?: string);
}
/**
 * Error class for validation failures
 */
export declare class ValidationError extends BigQueryError {
    constructor(message: string, details?: unknown);
}
/**
 * Express error handler for BigQuery routes
 */
export declare const bigQueryErrorHandler: ErrorRequestHandler;
/**
 * Type for query authorization function
 */
export type AuthorizeQueryFn = (sql: string, params?: Record<string, unknown>, req?: Request) => boolean | Promise<boolean>;
/**
 * Default authorization function that allows all queries
 */
export declare const defaultAuthorizeQuery: AuthorizeQueryFn;
/**
 * Create an authorization function that blocks dangerous SQL keywords
 */
export declare function createSafeQueryAuthorizer(blockedKeywords?: string[]): AuthorizeQueryFn;
//# sourceMappingURL=middleware.d.ts.map