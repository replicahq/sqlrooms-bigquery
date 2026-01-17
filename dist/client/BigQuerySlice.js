import { produce } from 'immer';
import { tableFromIPC } from 'apache-arrow';
import { base64ToArrowIPC } from '../core/arrow-serialization.js';
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
export function createBigQuerySlice(props) {
    return (set, get, _store) => {
        const updateBigQuery = (updates) => {
            set((state) => produce(state, (draft) => {
                Object.assign(draft.bigquery, updates);
            }));
        };
        const fetchJson = async (endpoint, body) => {
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
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
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
                        const response = await fetchJson('/query/arrow', { sql, params });
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
                    }
                    catch (error) {
                        const message = error instanceof Error ? error.message : 'Query failed';
                        updateBigQuery({ isLoading: false, error: message });
                        throw error;
                    }
                },
                executeQuery: async (sql, params) => {
                    updateBigQuery({ isLoading: true, error: null });
                    try {
                        const response = await fetchJson('/query', {
                            sql,
                            params,
                        });
                        updateBigQuery({ isLoading: false });
                        return response.rows;
                    }
                    catch (error) {
                        const message = error instanceof Error ? error.message : 'Query failed';
                        updateBigQuery({ isLoading: false, error: message });
                        throw error;
                    }
                },
                executeQueryArrow: async (sql, params) => {
                    updateBigQuery({ isLoading: true, error: null });
                    try {
                        const response = await fetchJson('/query/arrow', { sql, params });
                        const buffer = base64ToArrowIPC(response.data);
                        updateBigQuery({ isLoading: false });
                        return { buffer, rowCount: response.rowCount };
                    }
                    catch (error) {
                        const message = error instanceof Error ? error.message : 'Query failed';
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
//# sourceMappingURL=BigQuerySlice.js.map