import { BigQuery } from '@google-cloud/bigquery';
import { rowsToArrowIPC } from './arrow-serialization.js';
/**
 * A wrapper around the Google Cloud BigQuery client that provides
 * a simplified API for common operations, including Arrow IPC output.
 */
export class BigQueryClient {
    bigquery;
    projectId;
    constructor(config) {
        this.projectId = config.projectId;
        this.bigquery = new BigQuery({
            projectId: config.projectId,
            keyFilename: config.keyFilename,
            location: config.location,
        });
    }
    /**
     * Execute a SQL query and return results as JSON rows
     */
    async query(sql, options = {}) {
        // For dry run, use createQueryJob to get metadata
        if (options.dryRun) {
            const [job] = await this.bigquery.createQueryJob({
                query: sql,
                params: options.params,
                useLegacySql: options.useLegacySql ?? false,
                dryRun: true,
            });
            const metadata = job.metadata;
            return {
                rows: [],
                totalBytesProcessed: metadata?.statistics?.query?.totalBytesProcessed,
                cacheHit: metadata?.statistics?.query?.cacheHit,
                jobId: metadata?.jobReference?.jobId,
            };
        }
        // For normal queries, use the simple query method
        const [rows] = await this.bigquery.query({
            query: sql,
            params: options.params,
            maxResults: options.maxResults,
            useLegacySql: options.useLegacySql ?? false,
            jobTimeoutMs: options.timeoutMs,
        });
        return {
            rows: rows,
        };
    }
    /**
     * Execute a SQL query and return results as an Arrow IPC buffer
     */
    async queryArrow(sql, options = {}) {
        const result = await this.query(sql, options);
        const buffer = rowsToArrowIPC(result.rows);
        return {
            buffer,
            rowCount: result.rows.length,
            totalBytesProcessed: result.totalBytesProcessed,
            cacheHit: result.cacheHit,
        };
    }
    /**
     * Validate a SQL query without executing it (dry run)
     */
    async validateQuery(sql, options = {}) {
        try {
            const [job] = await this.bigquery.createQueryJob({
                query: sql,
                params: options.params,
                useLegacySql: options.useLegacySql ?? false,
                dryRun: true,
            });
            const metadata = job.metadata;
            const schemaFields = metadata?.statistics?.query?.schema?.fields;
            const schema = schemaFields?.map((field) => ({
                name: field.name ?? '',
                type: field.type ?? '',
                mode: field.mode,
            }));
            return {
                valid: true,
                totalBytesProcessed: metadata?.statistics?.query?.totalBytesProcessed,
                schema,
            };
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown validation error',
            };
        }
    }
    /**
     * Get the underlying BigQuery client instance for advanced operations
     */
    getClient() {
        return this.bigquery;
    }
    /**
     * Get the project ID
     */
    getProjectId() {
        return this.projectId;
    }
}
//# sourceMappingURL=BigQueryClient.js.map