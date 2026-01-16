import { z } from 'zod';

/**
 * Schema for query request body
 */
export const QueryRequestSchema = z.object({
  /**
   * SQL query to execute
   */
  sql: z.string().min(1, 'SQL query is required'),

  /**
   * Named parameters for the query
   */
  params: z.record(z.unknown()).optional(),

  /**
   * Maximum number of rows to return
   */
  maxResults: z.number().positive().optional(),

  /**
   * Query timeout in milliseconds
   */
  timeoutMs: z.number().positive().optional(),
});

export type QueryRequest = z.infer<typeof QueryRequestSchema>;

/**
 * Schema for query response (JSON format)
 */
export const QueryResponseSchema = z.object({
  rows: z.array(z.record(z.unknown())),
  rowCount: z.number(),
  totalBytesProcessed: z.string().optional(),
  cacheHit: z.boolean().optional(),
});

export type QueryResponse = z.infer<typeof QueryResponseSchema>;

/**
 * Schema for Arrow query response
 */
export const ArrowQueryResponseSchema = z.object({
  /**
   * Base64-encoded Arrow IPC buffer
   */
  data: z.string(),
  rowCount: z.number(),
  totalBytesProcessed: z.string().optional(),
  cacheHit: z.boolean().optional(),
});

export type ArrowQueryResponse = z.infer<typeof ArrowQueryResponseSchema>;

/**
 * Schema for validation request
 */
export const ValidateRequestSchema = z.object({
  sql: z.string().min(1, 'SQL query is required'),
  params: z.record(z.unknown()).optional(),
});

export type ValidateRequest = z.infer<typeof ValidateRequestSchema>;

/**
 * Schema for validation response
 */
export const ValidationResponseSchema = z.object({
  valid: z.boolean(),
  error: z.string().optional(),
  totalBytesProcessed: z.string().optional(),
  schema: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        mode: z.string().optional(),
      })
    )
    .optional(),
});

export type ValidationResponse = z.infer<typeof ValidationResponseSchema>;

/**
 * Schema for API error response
 */
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
  code: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
