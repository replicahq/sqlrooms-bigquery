import { tableFromIPC } from 'apache-arrow';
/**
 * Interface for DuckDB connection that supports Arrow insertion
 * This matches the WasmDuckDbConnector.getConnection() return type
 */
export interface DuckDbConnection {
    insertArrowTable(table: ReturnType<typeof tableFromIPC>, options: {
        name: string;
        create?: boolean;
        schema?: string;
    }): Promise<void>;
}
/**
 * Interface for DuckDB connector
 */
export interface DuckDbConnector {
    query(sql: string): Promise<unknown>;
    getConnection(): DuckDbConnection;
}
/**
 * Load base64-encoded Arrow IPC data into a DuckDB table
 */
export declare function loadArrowToTable(connector: DuckDbConnector, base64Data: string, tableName: string, options?: {
    dropExisting?: boolean;
    createView?: string;
    viewSql?: string;
}): Promise<{
    rowCount: number;
}>;
/**
 * Load multiple Arrow tables in parallel
 */
export declare function loadArrowTablesToDb(connector: DuckDbConnector, tables: Array<{
    name: string;
    base64Data: string;
    dropExisting?: boolean;
}>): Promise<Map<string, number>>;
/**
 * Decode base64 to Uint8Array (browser-compatible)
 */
export declare function base64ToUint8Array(base64: string): Uint8Array;
//# sourceMappingURL=arrow-loader.d.ts.map