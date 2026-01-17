import { z } from 'zod';
/**
 * Schema for query request body
 */
export declare const QueryRequestSchema: z.ZodObject<{
    /**
     * SQL query to execute
     */
    sql: z.ZodString;
    /**
     * Named parameters for the query
     */
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    /**
     * Maximum number of rows to return
     */
    maxResults: z.ZodOptional<z.ZodNumber>;
    /**
     * Query timeout in milliseconds
     */
    timeoutMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sql: string;
    params?: Record<string, unknown> | undefined;
    maxResults?: number | undefined;
    timeoutMs?: number | undefined;
}, {
    sql: string;
    params?: Record<string, unknown> | undefined;
    maxResults?: number | undefined;
    timeoutMs?: number | undefined;
}>;
export type QueryRequest = z.infer<typeof QueryRequestSchema>;
/**
 * Schema for query response (JSON format)
 */
export declare const QueryResponseSchema: z.ZodObject<{
    rows: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">;
    rowCount: z.ZodNumber;
    totalBytesProcessed: z.ZodOptional<z.ZodString>;
    cacheHit: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    rows: Record<string, unknown>[];
    rowCount: number;
    totalBytesProcessed?: string | undefined;
    cacheHit?: boolean | undefined;
}, {
    rows: Record<string, unknown>[];
    rowCount: number;
    totalBytesProcessed?: string | undefined;
    cacheHit?: boolean | undefined;
}>;
export type QueryResponse = z.infer<typeof QueryResponseSchema>;
/**
 * Schema for Arrow query response
 */
export declare const ArrowQueryResponseSchema: z.ZodObject<{
    /**
     * Base64-encoded Arrow IPC buffer
     */
    data: z.ZodString;
    rowCount: z.ZodNumber;
    totalBytesProcessed: z.ZodOptional<z.ZodString>;
    cacheHit: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    rowCount: number;
    data: string;
    totalBytesProcessed?: string | undefined;
    cacheHit?: boolean | undefined;
}, {
    rowCount: number;
    data: string;
    totalBytesProcessed?: string | undefined;
    cacheHit?: boolean | undefined;
}>;
export type ArrowQueryResponse = z.infer<typeof ArrowQueryResponseSchema>;
/**
 * Schema for validation request
 */
export declare const ValidateRequestSchema: z.ZodObject<{
    sql: z.ZodString;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    sql: string;
    params?: Record<string, unknown> | undefined;
}, {
    sql: string;
    params?: Record<string, unknown> | undefined;
}>;
export type ValidateRequest = z.infer<typeof ValidateRequestSchema>;
/**
 * Schema for validation response
 */
export declare const ValidationResponseSchema: z.ZodObject<{
    valid: z.ZodBoolean;
    error: z.ZodOptional<z.ZodString>;
    totalBytesProcessed: z.ZodOptional<z.ZodString>;
    schema: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodString;
        mode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        name: string;
        mode?: string | undefined;
    }, {
        type: string;
        name: string;
        mode?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    valid: boolean;
    totalBytesProcessed?: string | undefined;
    error?: string | undefined;
    schema?: {
        type: string;
        name: string;
        mode?: string | undefined;
    }[] | undefined;
}, {
    valid: boolean;
    totalBytesProcessed?: string | undefined;
    error?: string | undefined;
    schema?: {
        type: string;
        name: string;
        mode?: string | undefined;
    }[] | undefined;
}>;
export type ValidationResponse = z.infer<typeof ValidationResponseSchema>;
/**
 * Schema for API error response
 */
export declare const ErrorResponseSchema: z.ZodObject<{
    error: z.ZodString;
    details: z.ZodOptional<z.ZodUnknown>;
    code: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error: string;
    code?: string | undefined;
    details?: unknown;
}, {
    error: string;
    code?: string | undefined;
    details?: unknown;
}>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
//# sourceMappingURL=schemas.d.ts.map