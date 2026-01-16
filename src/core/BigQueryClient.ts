import { BigQuery } from '@google-cloud/bigquery';
import type {
  BigQueryClientConfig,
  QueryOptions,
  QueryResult,
  ArrowQueryResult,
  ValidationResult,
} from './types.js';
import { rowsToArrowIPC } from './arrow-serialization.js';

/**
 * A wrapper around the Google Cloud BigQuery client that provides
 * a simplified API for common operations, including Arrow IPC output.
 */
export class BigQueryClient {
  private bigquery: BigQuery;
  private projectId: string;

  constructor(config: BigQueryClientConfig) {
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
  async query<T = Record<string, unknown>>(
    sql: string,
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
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
        rows: [] as T[],
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
      rows: rows as T[],
    };
  }

  /**
   * Execute a SQL query and return results as an Arrow IPC buffer
   */
  async queryArrow(
    sql: string,
    options: QueryOptions = {}
  ): Promise<ArrowQueryResult> {
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
  async validateQuery(
    sql: string,
    options: Omit<QueryOptions, 'dryRun'> = {}
  ): Promise<ValidationResult> {
    try {
      const [job] = await this.bigquery.createQueryJob({
        query: sql,
        params: options.params,
        useLegacySql: options.useLegacySql ?? false,
        dryRun: true,
      });

      const metadata = job.metadata;
      const schemaFields = metadata?.statistics?.query?.schema?.fields;
      const schema = schemaFields?.map((field: { name?: string; type?: string; mode?: string }) => ({
        name: field.name ?? '',
        type: field.type ?? '',
        mode: field.mode,
      }));

      return {
        valid: true,
        totalBytesProcessed: metadata?.statistics?.query?.totalBytesProcessed,
        schema,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error',
      };
    }
  }

  /**
   * Get the underlying BigQuery client instance for advanced operations
   */
  getClient(): BigQuery {
    return this.bigquery;
  }

  /**
   * Get the project ID
   */
  getProjectId(): string {
    return this.projectId;
  }
}
