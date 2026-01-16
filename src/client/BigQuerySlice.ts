import { produce, Draft } from 'immer';
import { tableFromIPC } from 'apache-arrow';
import { base64ToArrowIPC } from '../core/arrow-serialization.js';
import type {
  QueryRequest,
  QueryResponse,
  ArrowQueryResponse,
} from '../shared/schemas.js';

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
    queryToTable: (
      sql: string,
      tableName: string,
      options?: {
        params?: Record<string, unknown>;
        dropExisting?: boolean;
      }
    ) => Promise<{ rowCount: number }>;

    /**
     * Execute a SQL query and return JSON rows
     */
    executeQuery: <T = Record<string, unknown>>(
      sql: string,
      params?: Record<string, unknown>
    ) => Promise<T[]>;

    /**
     * Execute a SQL query and return Arrow IPC buffer
     */
    executeQueryArrow: (
      sql: string,
      params?: Record<string, unknown>
    ) => Promise<{ buffer: Uint8Array; rowCount: number }>;

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
        insertArrowTable: (
          table: ReturnType<typeof tableFromIPC>,
          options: { name: string }
        ) => Promise<void>;
      };
    } | null;
    refreshTableSchemas: () => Promise<void>;
  };
}

/**
 * Slice creator type for SQLRooms compatibility
 */
type SliceCreator<TSlice, TStore> = (
  set: (updater: (state: TStore) => TStore | Partial<TStore>) => void,
  get: () => TStore,
  store: unknown
) => TSlice;

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
export function createBigQuerySlice(props: {
  config: BigQuerySliceConfig;
}): SliceCreator<BigQuerySliceState, BigQuerySliceState & DuckDbSliceState> {
  return (set, get, _store) => {
    // Type-safe state update helper
    type BigQueryStateData = Pick<
      BigQuerySliceState['bigquery'],
      'isLoading' | 'error' | 'lastQueryTime'
    >;

    const updateBigQuery = (updates: Partial<BigQueryStateData>) => {
      set((state) =>
        produce(state, (draft: Draft<BigQuerySliceState & DuckDbSliceState>) => {
          Object.assign(draft.bigquery, updates);
        })
      );
    };

    const fetchJson = async <T>(
      endpoint: string,
      body: unknown
    ): Promise<T> => {
      const { config } = get().bigquery;
      const response = await fetch(`${config.apiEndpoint}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return response.json();
    };

    return {
      bigquery: {
        config: props.config,
        isLoading: false,
        error: null,
        lastQueryTime: null,

        queryToTable: async (sql, tableName, options = {}) => {
          const { params, dropExisting = true } = options;
          const startTime = Date.now();

          updateBigQuery({ isLoading: true, error: null });

          try {
            // Fetch Arrow data from API
            const response = await fetchJson<ArrowQueryResponse>(
              '/query/arrow',
              { sql, params } satisfies QueryRequest
            );

            // Load into DuckDB
            const db = get().db;
            if (!db?.connector) {
              throw new Error('DuckDB not ready');
            }

            // Drop existing table if requested
            if (dropExisting) {
              await db.connector.query(`DROP TABLE IF EXISTS ${tableName}`);
            }

            // Decode Arrow and insert
            const arrowBytes = base64ToArrowIPC(response.data);
            const arrowTable = tableFromIPC(arrowBytes);
            const conn = db.connector.getConnection();
            await conn.insertArrowTable(arrowTable, { name: tableName });

            // Refresh table list
            await db.refreshTableSchemas();

            const elapsed = Date.now() - startTime;
            updateBigQuery({ isLoading: false, lastQueryTime: elapsed });

            return { rowCount: response.rowCount };
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Query failed';
            updateBigQuery({ isLoading: false, error: message });
            throw error;
          }
        },

        executeQuery: async <T = Record<string, unknown>>(
          sql: string,
          params?: Record<string, unknown>
        ): Promise<T[]> => {
          updateBigQuery({ isLoading: true, error: null });

          try {
            const response = await fetchJson<QueryResponse>('/query', {
              sql,
              params,
            } satisfies QueryRequest);

            updateBigQuery({ isLoading: false });

            return response.rows as T[];
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Query failed';
            updateBigQuery({ isLoading: false, error: message });
            throw error;
          }
        },

        executeQueryArrow: async (
          sql: string,
          params?: Record<string, unknown>
        ) => {
          updateBigQuery({ isLoading: true, error: null });

          try {
            const response = await fetchJson<ArrowQueryResponse>(
              '/query/arrow',
              { sql, params } satisfies QueryRequest
            );

            const buffer = base64ToArrowIPC(response.data);

            updateBigQuery({ isLoading: false });

            return { buffer, rowCount: response.rowCount };
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Query failed';
            updateBigQuery({ isLoading: false, error: message });
            throw error;
          }
        },

        clearError: () => {
          updateBigQuery({ error: null });
        },
      },
    };
  };
}
