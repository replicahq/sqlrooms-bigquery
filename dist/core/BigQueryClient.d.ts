import { BigQuery } from '@google-cloud/bigquery';
import type { BigQueryClientConfig, QueryOptions, QueryResult, ArrowQueryResult, ValidationResult } from './types.js';
/**
 * A wrapper around the Google Cloud BigQuery client that provides
 * a simplified API for common operations, including Arrow IPC output.
 */
export declare class BigQueryClient {
    private bigquery;
    private projectId;
    constructor(config: BigQueryClientConfig);
    /**
     * Execute a SQL query and return results as JSON rows
     */
    query<T = Record<string, unknown>>(sql: string, options?: QueryOptions): Promise<QueryResult<T>>;
    /**
     * Execute a SQL query and return results as an Arrow IPC buffer
     */
    queryArrow(sql: string, options?: QueryOptions): Promise<ArrowQueryResult>;
    /**
     * Validate a SQL query without executing it (dry run)
     */
    validateQuery(sql: string, options?: Omit<QueryOptions, 'dryRun'>): Promise<ValidationResult>;
    /**
     * Get the underlying BigQuery client instance for advanced operations
     */
    getClient(): BigQuery;
    /**
     * Get the project ID
     */
    getProjectId(): string;
}
//# sourceMappingURL=BigQueryClient.d.ts.map