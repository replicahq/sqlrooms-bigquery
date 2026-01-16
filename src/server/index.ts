// Server-side exports
export { BigQueryClient } from '../core/BigQueryClient.js';
export type {
  BigQueryClientConfig,
  QueryOptions,
  QueryResult,
  ArrowQueryResult,
  ValidationResult,
} from '../core/types.js';

export {
  createBigQueryRouter,
  type BigQueryRouterConfig,
} from './createBigQueryRouter.js';

export {
  BigQueryError,
  AuthorizationError,
  ValidationError,
  bigQueryErrorHandler,
  defaultAuthorizeQuery,
  createSafeQueryAuthorizer,
  type AuthorizeQueryFn,
} from './middleware.js';

export {
  rowsToArrowIPC,
  arrowIPCToBase64,
  base64ToArrowIPC,
  arrowIPCToTable,
  arrowIPCToRows,
} from '../core/arrow-serialization.js';

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
} from '../shared/schemas.js';
