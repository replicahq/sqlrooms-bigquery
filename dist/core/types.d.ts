/**
 * Options for BigQuery queries
 */
export interface QueryOptions {
    /**
     * Named parameters for the query
     */
    params?: Record<string, unknown>;
    /**
     * Maximum number of rows to return
     */
    maxResults?: number;
    /**
     * Whether to use legacy SQL syntax (default: false, uses standard SQL)
     */
    useLegacySql?: boolean;
    /**
     * Query timeout in milliseconds
     */
    timeoutMs?: number;
    /**
     * Whether to perform a dry run (validate query without executing)
     */
    dryRun?: boolean;
}
/**
 * Result of a BigQuery query
 */
export interface QueryResult<T = Record<string, unknown>> {
    /**
     * The query result rows
     */
    rows: T[];
    /**
     * Total bytes processed by the query
     */
    totalBytesProcessed?: string;
    /**
     * Whether the query was served from cache
     */
    cacheHit?: boolean;
    /**
     * Job metadata
     */
    jobId?: string;
}
/**
 * Result of an Arrow query
 */
export interface ArrowQueryResult {
    /**
     * Arrow IPC buffer containing the query results
     */
    buffer: Uint8Array;
    /**
     * Number of rows in the result
     */
    rowCount: number;
    /**
     * Total bytes processed by the query
     */
    totalBytesProcessed?: string;
    /**
     * Whether the query was served from cache
     */
    cacheHit?: boolean;
}
/**
 * Configuration options for BigQueryClient
 */
export interface BigQueryClientConfig {
    /**
     * Google Cloud project ID
     */
    projectId: string;
    /**
     * Path to service account key file (optional, uses default credentials if not provided)
     */
    keyFilename?: string;
    /**
     * Default location for queries (e.g., 'US', 'EU')
     */
    location?: string;
}
/**
 * Validation result from a dry run query
 */
export interface ValidationResult {
    /**
     * Whether the query is valid
     */
    valid: boolean;
    /**
     * Error message if the query is invalid
     */
    error?: string;
    /**
     * Estimated bytes that would be processed
     */
    totalBytesProcessed?: string;
    /**
     * Schema of the result (column names and types)
     */
    schema?: Array<{
        name: string;
        type: string;
        mode?: string;
    }>;
}
//# sourceMappingURL=types.d.ts.map