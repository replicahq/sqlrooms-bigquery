import { Router } from 'express';
import { BigQueryClient } from '../core/BigQueryClient.js';
import { type AuthorizeQueryFn } from './middleware.js';
/**
 * Configuration options for the BigQuery router
 */
export interface BigQueryRouterConfig {
    /**
     * BigQuery client instance
     */
    client: BigQueryClient;
    /**
     * Function to authorize queries before execution
     * Return true to allow, false to reject
     */
    authorizeQuery?: AuthorizeQueryFn;
    /**
     * Whether to include the error handler middleware
     * Set to false if you want to use your own error handler
     */
    includeErrorHandler?: boolean;
}
/**
 * Create an Express router with BigQuery endpoints
 *
 * Endpoints:
 * - POST /query - Execute SQL and return JSON rows
 * - POST /query/arrow - Execute SQL and return base64 Arrow IPC
 * - POST /validate - Validate SQL without executing
 */
export declare function createBigQueryRouter(config: BigQueryRouterConfig): Router;
//# sourceMappingURL=createBigQueryRouter.d.ts.map