import { tableFromIPC } from 'apache-arrow';
import { base64ToArrowIPC } from '../core/arrow-serialization.js';
/**
 * Load base64-encoded Arrow IPC data into a DuckDB table
 */
export async function loadArrowToTable(connector, base64Data, tableName, options = {}) {
    const { dropExisting = true, createView, viewSql } = options;
    // Drop existing table if requested
    if (dropExisting) {
        await connector.query(`DROP TABLE IF EXISTS ${tableName}`);
    }
    // Decode and parse Arrow data
    const arrowBytes = base64ToArrowIPC(base64Data);
    const arrowTable = tableFromIPC(arrowBytes);
    // Get connection and insert Arrow table
    const conn = connector.getConnection();
    await conn.insertArrowTable(arrowTable, { name: tableName });
    // Create view if requested
    if (createView && viewSql) {
        await connector.query(`CREATE OR REPLACE VIEW ${createView} AS ${viewSql}`);
    }
    return { rowCount: arrowTable.numRows };
}
/**
 * Load multiple Arrow tables in parallel
 */
export async function loadArrowTablesToDb(connector, tables) {
    const results = new Map();
    await Promise.all(tables.map(async ({ name, base64Data, dropExisting = true }) => {
        const { rowCount } = await loadArrowToTable(connector, base64Data, name, { dropExisting });
        results.set(name, rowCount);
    }));
    return results;
}
/**
 * Decode base64 to Uint8Array (browser-compatible)
 */
export function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
//# sourceMappingURL=arrow-loader.js.map