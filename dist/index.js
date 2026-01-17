// Main package exports - shared types and utilities
// For server-specific exports, use '@sqlrooms/bigquery/server'
// For client-specific exports, use '@sqlrooms/bigquery/client'
// Arrow serialization utilities (work in both environments)
export { rowsToArrowIPC, arrowIPCToBase64, base64ToArrowIPC, arrowIPCToTable, arrowIPCToRows, } from './core/arrow-serialization.js';
// Shared schemas
export { QueryRequestSchema, QueryResponseSchema, ArrowQueryResponseSchema, ValidateRequestSchema, ValidationResponseSchema, ErrorResponseSchema, } from './shared/schemas.js';
//# sourceMappingURL=index.js.map