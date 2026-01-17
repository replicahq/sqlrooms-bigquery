// Server-side exports
export { BigQueryClient } from '../core/BigQueryClient.js';
export { createBigQueryRouter, } from './createBigQueryRouter.js';
export { BigQueryError, AuthorizationError, ValidationError, bigQueryErrorHandler, defaultAuthorizeQuery, createSafeQueryAuthorizer, } from './middleware.js';
export { rowsToArrowIPC, arrowIPCToBase64, base64ToArrowIPC, arrowIPCToTable, arrowIPCToRows, } from '../core/arrow-serialization.js';
export { QueryRequestSchema, QueryResponseSchema, ArrowQueryResponseSchema, ValidateRequestSchema, ValidationResponseSchema, ErrorResponseSchema, } from '../shared/schemas.js';
//# sourceMappingURL=index.js.map