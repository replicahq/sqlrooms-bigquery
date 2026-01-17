import * as arrow from 'apache-arrow';
/**
 * Convert an array of row objects to Arrow IPC format
 */
export declare function rowsToArrowIPC(rows: Record<string, unknown>[]): Uint8Array;
/**
 * Encode Arrow IPC buffer to base64 string
 */
export declare function arrowIPCToBase64(buffer: Uint8Array): string;
/**
 * Decode base64 string to Arrow IPC buffer
 */
export declare function base64ToArrowIPC(base64: string): Uint8Array;
/**
 * Parse Arrow IPC buffer to Arrow Table
 */
export declare function arrowIPCToTable(buffer: Uint8Array): arrow.Table;
/**
 * Convert Arrow IPC buffer to JSON rows
 */
export declare function arrowIPCToRows<T = Record<string, unknown>>(buffer: Uint8Array): T[];
//# sourceMappingURL=arrow-serialization.d.ts.map