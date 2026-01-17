# Library Management RESTful API

This project is a small RESTful API for a library management system. It implements CRUD for books, authors, members, and loans. It also demonstrates HTTP caching (ETag + Cache-Control) and includes a benchmark script that measures response times and caching effectiveness.

Files added:
- `src/index.js` — Express server entry point
- `src/routes/*.js` — route handlers for books, authors, members, loans
- `src/data/store.js` — in-memory data store (seeded)
- `scripts/benchmark.js` — runs simple timing tests against the API

Quick start

1. Install dependencies:

```powershell
cd "c:\Users\LabStudent\Desktop\kwizera assignment"
npm install
```

2. Start the server:

```powershell
npm start
```

3. In another shell run the benchmark (expects server on http://localhost:3000):

```powershell
npm run benchmark
```

Notes
- The API uses in-memory storage — data will reset when server restarts.
- Responses include ETag and Cache-Control headers for GET endpoints.

Richardson Maturity Model analysis and measured results are in the project README and are summarized in the project deliverable.
