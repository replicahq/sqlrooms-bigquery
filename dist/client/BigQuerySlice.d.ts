import { tableFromIPC } from 'apache-arrow';
/**
 * Configuration for the BigQuery slice
 */
export interface BigQuerySliceConfig {
    /**
     * Base URL for the BigQuery API endpoint
     */
    apiEndpoint: string;
    /**
     * Optional headers to include with all requests
     */
    headers?: Record<string, string>;
}
/**
 * State shape for the BigQuery slice
 */
export interface BigQuerySliceState {
    bigquery: {
        config: BigQuerySliceConfig;
        isLoading: boolean;
        error: string | null;
        lastQueryTime: number | null;
        /**
         * Execute a SQL query and load results into a DuckDB table
         */
        queryToTable: (sql: string, tableName: string, options?: {
            params?: Record<string, unknown>;
            dropExisting?: boolean;
        }) => Promise<{
            rowCount: number;
        }>;
        /**
         * Execute a SQL query and return JSON rows
         */
        executeQuery: <T = Record<string, unknown>>(sql: string, params?: Record<string, unknown>) => Promise<T[]>;
        /**
         * Execute a SQL query and return Arrow IPC buffer
         */
        executeQueryArrow: (sql: string, params?: Record<string, unknown>) => Promise<{
            buffer: Uint8Array;
            rowCount: number;
        }>;
        /**
         * Clear any error state
         */
        clearError: () => void;
    };
}
/**
 * Interface for the DuckDB slice state (expected from @sqlrooms/duckdb)
 */
interface DuckDbSliceState {
    db: {
        connector: {
            query: (sql: string) => Promise<unknown>;
            getConnection: () => {
                insertArrowTable: (table: ReturnType<typeof tableFromIPC>, options: {
                    name: string;
                }) => Promise<void>;
            };
        } | null;
        refreshTableSchemas: () => Promise<void>;
    };
}
/**
 * Slice creator type for SQLRooms compatibility
 */
type SliceCreator<TSlice, TStore> = (set: (updater: (state: TStore) => TStore | Partial<TStore>) => void, get: () => TStore, store: unknown) => TSlice;
/**
 * Create a BigQuery slice for use with SQLRooms store
 *
 * @example
 * ```typescript
 * const useStore = createRoomStore({
 *   ...createDuckDbSlice(),
 *   ...createBigQuerySlice({
 *     config: { apiEndpoint: '/api/bq' }
 *   }),
 * });
 *
 * // In components
 * const { queryToTable, isLoading } = useStore(s => s.bigquery);
 * await queryToTable('SELECT * FROM sales', 'my_table');
 * ```
 */
export declare function createBigQuerySlice(props: {
    config: BigQuerySliceConfig;
}): SliceCreator<BigQuerySliceState, BigQuerySliceState & DuckDbSliceState>;
export {};
//# sourceMappingURL=BigQuerySlice.d.ts.map