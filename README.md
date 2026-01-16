# @sqlrooms/bigquery

BigQuery IO utilities for SQLRooms applications. This package provides server-side BigQuery client wrappers, Express router factories, and client-side utilities for loading BigQuery data into DuckDB-WASM.

## Installation

```bash
npm install @sqlrooms/bigquery
```

## Features

- **BigQueryClient**: Wrapper around `@google-cloud/bigquery` with simplified API
- **Arrow serialization**: Convert BigQuery rows to Apache Arrow IPC format for efficient transfer
- **Express router factory**: Pre-built routes for executing queries via HTTP
- **Query authorization**: Configurable query validation and authorization
- **Client-side Zustand slice**: Load BigQuery data directly into DuckDB-WASM
- **Type-safe schemas**: Zod schemas for request/response validation

## Usage

### Server Side

```typescript
import express from 'express';
import {
  BigQueryClient,
  createBigQueryRouter,
  createSafeQueryAuthorizer,
  rowsToArrowIPC,
  arrowIPCToBase64,
} from '@sqlrooms/bigquery/server';

const app = express();

// Initialize BigQuery client
const bigQueryClient = new BigQueryClient({
  projectId: process.env.BIGQUERY_PROJECT,
});

// Option 1: Use the pre-built router for ad-hoc queries
const bigQueryRouter = createBigQueryRouter({
  client: bigQueryClient,
  authorizeQuery: createSafeQueryAuthorizer(), // Blocks mutations
});
app.use('/api/bq', bigQueryRouter);

// Option 2: Build custom endpoints
app.post('/api/data/load', async (req, res) => {
  const result = await bigQueryClient.query(`
    SELECT * FROM \`my-project.dataset.table\`
    LIMIT @limit
  `, {
    params: { limit: req.body.limit },
  });

  // Convert to Arrow for efficient transfer
  const arrowBuffer = rowsToArrowIPC(result.rows);
  const base64Data = arrowIPCToBase64(arrowBuffer);

  res.json({ data: base64Data, rowCount: result.rows.length });
});
```

### Client Side

```typescript
import { tableFromIPC } from 'apache-arrow';
import { base64ToArrowIPC } from '@sqlrooms/bigquery/client';

// Fetch data from your server
const response = await fetch('/api/data/load', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ limit: 10000 }),
});
const { data } = await response.json();

// Decode Arrow data
const arrowBytes = base64ToArrowIPC(data);
const arrowTable = tableFromIPC(arrowBytes);

// Load into DuckDB-WASM
const conn = duckdb.getConnection();
await conn.insertArrowTable(arrowTable, { name: 'my_table' });
```

### With Zustand Slice (SQLRooms pattern)

```typescript
import { createBigQuerySlice } from '@sqlrooms/bigquery/client';

// In your store definition
const store = create<AppState>()(
  ...createBigQuerySlice({
    config: {
      apiEndpoint: '/api/bq',
    },
  }),
);

// In your components
const { queryToTable, isLoading } = useStore((s) => s.bigquery);

// Execute query and load results into DuckDB
await queryToTable('SELECT * FROM dataset.table LIMIT 1000', 'local_table');
```

## API Reference

### Server Exports (`@sqlrooms/bigquery/server`)

| Export | Description |
|--------|-------------|
| `BigQueryClient` | Wrapper class for BigQuery operations |
| `createBigQueryRouter` | Express router factory with `/query`, `/query/arrow`, `/validate` endpoints |
| `createSafeQueryAuthorizer` | Returns authorizer that blocks INSERT/UPDATE/DELETE/DROP |
| `rowsToArrowIPC` | Convert JSON rows to Arrow IPC buffer |
| `arrowIPCToBase64` | Encode Arrow buffer as base64 string |
| `bigQueryErrorHandler` | Express error handling middleware |

### Client Exports (`@sqlrooms/bigquery/client`)

| Export | Description |
|--------|-------------|
| `createBigQuerySlice` | Zustand slice factory for BigQuery operations |
| `base64ToArrowIPC` | Decode base64 string to Arrow IPC buffer |
| `loadArrowToTable` | Load Arrow buffer into DuckDB table |
| `arrowIPCToTable` | Convert Arrow IPC to Apache Arrow Table |

### Shared Exports (`@sqlrooms/bigquery`)

| Export | Description |
|--------|-------------|
| `QueryRequestSchema` | Zod schema for query requests |
| `QueryResponseSchema` | Zod schema for JSON query responses |
| `ArrowQueryResponseSchema` | Zod schema for Arrow query responses |
| `ErrorResponseSchema` | Zod schema for error responses |

## Authentication

The package uses Google Cloud's Application Default Credentials. Set up authentication using one of:

```bash
# Option 1: Service account key file
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"

# Option 2: gcloud CLI (for local development)
gcloud auth application-default login
```

## License

MIT
