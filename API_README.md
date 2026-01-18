# Library Management RESTful API (API-focused README)

This is the API documentation for the Library Management microservice implemented in `src/`.
It provides CRUD for Books, Authors, Members, and Loans, demonstrates conditional HTTP caching (ETag + Cache-Control), and includes a small benchmark tool.

## Quick setup (PowerShell)

1. Change to the project folder and install dependencies:

```powershell
cd "c:\Users\LabStudent\Desktop\kwizera assignment\Group-7-Distributed-Systems-and-Web-Architecture"
npm install
```

2. Configure the database connection (recommended: copy `.env.example`):

```powershell
Copy-Item .\.env.example .\.env
# Edit .env if you need to change DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME
```

If you're using XAMPP/MariaDB locally the defaults in `.env.example` (user `root` with empty password) work out-of-the-box.

3. Run the migrations (creates `library` DB and tables):

```powershell
npm run migrate
```

4. Start the server:

```powershell
npm start
# development: npm run dev
```

## Endpoints (main)

- GET `/` — service entry with links to resources

- Books
  - GET `/books` — list books (ETag + Cache-Control)
  - GET `/books/:id` — get a book (ETag)
  - POST `/books` — create book (body: { title, authorId })
  - PUT/PATCH `/books/:id` — update book
  - DELETE `/books/:id` — delete (returns JSON confirmation)

- Authors
  - GET `/authors`, POST `/authors`, GET/PUT/DELETE `/authors/:id`

- Members
  - GET `/members`, POST `/members`, GET/PUT/DELETE `/members/:id`

- Loans
  - GET `/loans`, POST `/loans` (body: { bookId, memberId }), POST `/loans/:id/return`, DELETE `/loans/:id`

## Caching and conditional requests

- GET endpoints set `ETag` and `Cache-Control`. `ETag` is an MD5 of the JSON response.
- The API honors `If-None-Match` and returns `304 Not Modified` when the resource hasn't changed.

Example (curl):

```powershell
curl -i http://localhost:3000/books
# copy ETag from headers
curl -i -H "If-None-Match: <etag>" http://localhost:3000/books
# If unchanged: 304 Not Modified
```

## Benchmarking

Use `scripts/benchmark.js` to measure average cold (non-conditional) request latency, conditional request latency, and 304 hit rates.

```powershell
npm run benchmark
```

See `scripts/benchmark.js` for details of the metrics and formulas.

## Where to look in the code

- `src/index.js` — app entry and middleware
- `src/routes/*.js` — endpoint implementations and ETag handling
- `src/data/repo.js` — DB queries and transactional loan logic
- `src/data/db.js` — MySQL client and migration helper
- `sql/create_library.sql` — schema
- `scripts/migrate.js` — runs the SQL migration

Full documentation, RMM analysis, setup notes and next steps are available in the top-level `README.md`. This file is a focused API guide; for the full project overview and benchmarking interpretation see `README.md`.

If you'd like, I can append measured benchmark output (from `npm run benchmark`) to this file once you paste the run results here.

## Benchmarking

Use `scripts/benchmark.js` to measure average cold (non-conditional) request latency, conditional request latency, and 304 hit rates.

```powershell
npm run benchmark
```

See `scripts/benchmark.js` for details of the metrics and formulas.

## Where to look in the code

- `src/index.js` — app entry and middleware
- `src/routes/*.js` — endpoint implementations and ETag handling
- `src/data/repo.js` — DB queries and transactional loan logic
- `src/data/db.js` — MySQL client and migration helper
- `sql/create_library.sql` — schema
- `scripts/migrate.js` — runs the SQL migration

Full documentation, RMM analysis, setup notes and next steps are available in the top-level `README.md`. This file is a focused API guide; for the full project overview and benchmarking interpretation see `README.md`.
