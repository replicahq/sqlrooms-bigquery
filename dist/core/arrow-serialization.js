import * as arrow from 'apache-arrow';
/**
 * Convert an array of row objects to Arrow IPC format
 */
export function rowsToArrowIPC(rows) {
    if (rows.length === 0) {
        // Return empty table
        return arrow.tableToIPC(arrow.tableFromArrays({}));
    }
    // Get all unique keys from the data
    const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))];
    // Build column arrays
    const columns = {};
    for (const key of keys) {
        columns[key] = rows.map((row) => row[key] ?? null);
    }
    const table = arrow.tableFromArrays(columns);
    return arrow.tableToIPC(table);
}
/**
 * Encode Arrow IPC buffer to base64 string
 */
export function arrowIPCToBase64(buffer) {
    // In Node.js environment
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(buffer).toString('base64');
    }
    // In browser environment
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
}
/**
 * Decode base64 string to Arrow IPC buffer
 */
export function base64ToArrowIPC(base64) {
    // In browser environment (also works in Node.js with atob polyfill)
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
/**
 * Parse Arrow IPC buffer to Arrow Table
 */
export function arrowIPCToTable(buffer) {
    return arrow.tableFromIPC(buffer);
}
/**
 * Convert Arrow IPC buffer to JSON rows
 */
export function arrowIPCToRows(buffer) {
    const table = arrow.tableFromIPC(buffer);
    return table.toArray();
}
//# sourceMappingURL=arrow-serialization.js.map