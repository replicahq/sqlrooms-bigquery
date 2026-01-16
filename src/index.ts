// Main package exports - shared types and utilities
// For server-specific exports, use '@sqlrooms/bigquery/server'
// For client-specific exports, use '@sqlrooms/bigquery/client'

// Core types
export type {
  BigQueryClientConfig,
  QueryOptions,
  QueryResult,
  ArrowQueryResult,
  ValidationResult,
} from './core/types.js';

// Arrow serialization utilities (work in both environments)
export {
  rowsToArrowIPC,
  arrowIPCToBase64,
  base64ToArrowIPC,
  arrowIPCToTable,
  arrowIPCToRows,
} from './core/arrow-serialization.js';

// Shared schemas
export {
  QueryRequestSchema,
  QueryResponseSchema,
  ArrowQueryResponseSchema,
  ValidateRequestSchema,
  ValidationResponseSchema,
  ErrorResponseSchema,
  type QueryRequest,
  type QueryResponse,
  type ArrowQueryResponse,
  type ValidateRequest,
  type ValidationResponse,
  type ErrorResponse,
} from './shared/schemas.js';
