import { z } from 'zod';
/**
 * Custom error class for BigQuery-related errors
 */
export class BigQueryError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code, details) {
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
    constructor(message = 'Query not authorized') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}
/**
 * Error class for validation failures
 */
export class ValidationError extends BigQueryError {
    constructor(message, details) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}
/**
 * Express error handler for BigQuery routes
 */
export const bigQueryErrorHandler = (err, _req, res, _next) => {
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
        const bqErr = err;
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
 * Default authorization function that allows all queries
 */
export const defaultAuthorizeQuery = () => true;
/**
 * Create an authorization function that blocks dangerous SQL keywords
 */
export function createSafeQueryAuthorizer(blockedKeywords = ['DELETE', 'DROP', 'TRUNCATE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE']) {
    return (sql) => {
        const upperSql = sql.toUpperCase();
        return !blockedKeywords.some((keyword) => upperSql.includes(keyword));
    };
}
//# sourceMappingURL=middleware.js.map