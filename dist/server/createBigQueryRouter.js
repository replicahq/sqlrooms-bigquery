import { Router } from 'express';
import { arrowIPCToBase64 } from '../core/arrow-serialization.js';
import { QueryRequestSchema, ValidateRequestSchema } from '../shared/schemas.js';
import { AuthorizationError, bigQueryErrorHandler, defaultAuthorizeQuery, } from './middleware.js';
/**
 * Create an Express router with BigQuery endpoints
 *
 * Endpoints:
 * - POST /query - Execute SQL and return JSON rows
 * - POST /query/arrow - Execute SQL and return base64 Arrow IPC
 * - POST /validate - Validate SQL without executing
 */
export function createBigQueryRouter(config) {
    const { client, authorizeQuery = defaultAuthorizeQuery, includeErrorHandler = true, } = config;
    const router = Router();
    /**
     * POST /query
     * Execute SQL and return JSON rows
     */
    router.post('/query', async (req, res, next) => {
        try {
            const { sql, params, maxResults, timeoutMs } = QueryRequestSchema.parse(req.body);
            // Check authorization
            const authorized = await authorizeQuery(sql, params, req);
            if (!authorized) {
                throw new AuthorizationError();
            }
            const result = await client.query(sql, {
                params,
                maxResults,
                timeoutMs,
            });
            res.json({
                rows: result.rows,
                rowCount: result.rows.length,
                totalBytesProcessed: result.totalBytesProcessed,
                cacheHit: result.cacheHit,
            });
        }
        catch (error) {
            next(error);
        }
    });
    /**
     * POST /query/arrow
     * Execute SQL and return base64-encoded Arrow IPC
     */
    router.post('/query/arrow', async (req, res, next) => {
        try {
            const { sql, params, maxResults, timeoutMs } = QueryRequestSchema.parse(req.body);
            // Check authorization
            const authorized = await authorizeQuery(sql, params, req);
            if (!authorized) {
                throw new AuthorizationError();
            }
            const result = await client.queryArrow(sql, {
                params,
                maxResults,
                timeoutMs,
            });
            res.json({
                data: arrowIPCToBase64(result.buffer),
                rowCount: result.rowCount,
                totalBytesProcessed: result.totalBytesProcessed,
                cacheHit: result.cacheHit,
            });
        }
        catch (error) {
            next(error);
        }
    });
    /**
     * POST /query/arrow/binary
     * Execute SQL and return raw Arrow IPC binary
     */
    router.post('/query/arrow/binary', async (req, res, next) => {
        try {
            const { sql, params, maxResults, timeoutMs } = QueryRequestSchema.parse(req.body);
            // Check authorization
            const authorized = await authorizeQuery(sql, params, req);
            if (!authorized) {
                throw new AuthorizationError();
            }
            const result = await client.queryArrow(sql, {
                params,
                maxResults,
                timeoutMs,
            });
            res.set('Content-Type', 'application/vnd.apache.arrow.stream');
            res.set('X-Row-Count', String(result.rowCount));
            if (result.totalBytesProcessed) {
                res.set('X-Total-Bytes-Processed', result.totalBytesProcessed);
            }
            res.send(Buffer.from(result.buffer));
        }
        catch (error) {
            next(error);
        }
    });
    /**
     * POST /validate
     * Validate SQL without executing (dry run)
     */
    router.post('/validate', async (req, res, next) => {
        try {
            const { sql, params } = ValidateRequestSchema.parse(req.body);
            // Check authorization even for validation
            const authorized = await authorizeQuery(sql, params, req);
            if (!authorized) {
                throw new AuthorizationError();
            }
            const result = await client.validateQuery(sql, { params });
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    });
    // Add error handler if requested
    if (includeErrorHandler) {
        router.use(bigQueryErrorHandler);
    }
    return router;
}
//# sourceMappingURL=createBigQueryRouter.js.map