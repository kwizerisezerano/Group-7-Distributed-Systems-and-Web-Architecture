

# Assignment — Library Management RESTful API (Answer format)

This document answers the assignment: "Design a complete RESTful API for a library management system. Implement all CRUD operations. Analyze your API against Richardson Maturity Model levels. Calculate API response times and caching effectiveness." Below We  provide the required deliverables, how we run the project, what we  implemented, and how the system meets the assignment criteria.

## 1) Assignment brief (what we  build)
- Build a RESTful API for a library that manages Books, Authors, Members and Loans(borrow).
- Use HTTP verbs correctly for CRUD and return appropriate status codes.
- Add persistence (MySQL/MariaDB) with migrations.
- Support HTTP caching (ETag + Cache-Control) and measure cache effectiveness.
- Provide documentation and benchmark scripts.

## 2) What we implemented (short answer)
- Full CRUD endpoints for `books`, `authors`, `members`, and `loans` in `src/routes/`.
- MySQL persistence using `mysql2` with `src/data/db.js` and `src/data/repo.js` (transactions for loaning/returning books).
- Migration SQL in `sql/create_library.sql` and runner `scripts/migrate.js`.
- ETag-based conditional GET handling and `Cache-Control` headers on read endpoints (see `src/routes/books.js`, `src/routes/authors.js`).
- `scripts/benchmark.js` to measure cold latency, conditional latency, 304 hit-rate and estimated bytes saved.

## 3) How to run (PowerShell, step-by-step)

```powershell
cd "C:\Users\LabStudent\Desktop\kwizera assignment\Group-7-Distributed-Systems-and-Web-Architecture"
$env:DB_HOST='127.0.0.1'
$env:DB_PORT='3306'
$env:DB_USER='root'
$env:DB_PASSWORD=''
$env:DB_NAME='library'
npm install
npm run migrate
npm start
```

## 4) Endpoints (concise list)

- GET `/` — service entry with links.
- Books: `GET /books`, `GET /books/:id`, `POST /books`, `PUT/PATCH /books/:id`, `DELETE /books/:id`.
- Authors: `GET /authors`, `GET /authors/:id`, `POST /authors`, `PUT/PATCH /authors/:id`, `DELETE /authors/:id`.
- Members: `GET /members`, `POST /members`, `GET/PUT/DELETE /members/:id`.
- Loans: `GET /loans`, `POST /loans` (body: { bookId, memberId }), `POST /loans/:id/return`, `DELETE /loans/:id`.

Refer to `src/routes/` for exact status codes and validation logic.

## 5) Richardson Maturity Model (direct answer)

- Level 1 (Resources): Achieved — separate URIs for `books`, `authors`, `members`, `loans`.
- Level 2 (HTTP verbs): Achieved — uses GET/POST/PUT/PATCH/DELETE with standard status codes (200, 201, 400, 404, 409, 500). `Location` header set on create.
- Level 3 (HATEOAS): Partially achieved — responses include minimal `links` objects. To fully achieve Level 3 (recommended next step), adopt a formal hypermedia format (HAL/JSON-LD/Siren) and include actionable controls (e.g., `return` action for loans with method POST and URI) in responses.

Files that demonstrate RMM choices: `src/routes/*.js` (link generation) and `src/index.js` (routing).

## 6) Caching & measurement (direct answer + how to reproduce)

- Implementation: `ETag` is computed as an MD5 of the JSON body and returned on GET responses. `Cache-Control` is set for list endpoints.
- Behavior: server checks `If-None-Match` and returns `304 Not Modified` when unchanged.

To measure caching effectiveness:

1. Start server (`npm start`).
2. Run the benchmark script:

```powershell
npm run benchmark
```

What the benchmark reports (definitions):
- cold_avg: average latency (ms) of non-conditional GETs.
- cond_avg: average latency (ms) of conditional GETs using `If-None-Match`.
- savings_pct = ((cold_avg - cond_avg) / cold_avg) * 100.
- cache_hit_rate = (304 responses / conditional requests) * 100.


> library-api@1.0.0 benchmark
> node scripts/benchmark.js

Benchmarking 20 GET /books requests (no conditional)
avg = 3.87 ms (n=20)
Using ETag: 794f135f245940208711182d1b9782e7
conditional avg = 1.68 ms (n=40), statuses: { '304': 40 }

Summary:
cold avg: 3.87 ms
conditional avg: 1.68 ms
approx response-time savings: 56.60%
cache hit-rate (304 responses): 100.00% (40/40)
PS C:\Users\LabStudent\Desktop\kwizera assignment\Group-7-Distributed-Systems-and-Web-Architecture> 


## 7) Files changed / important locations (short)
- `src/index.js` — app entry.
- `src/routes/books.js`, `src/routes/authors.js`, `src/routes/members.js`, `src/routes/loans.js` — endpoints & ETag logic.
- `src/data/db.js`, `src/data/repo.js` — DB client and queries (transactional loan logic).
- `sql/create_library.sql` — schema.
- `scripts/migrate.js` — migration runner.
- `scripts/benchmark.js` — benchmarking tool.

## 8) Example commands (quick)

Get service info:
```powershell
Invoke-RestMethod http://localhost:3000/
```

Create author:
```powershell
Invoke-RestMethod -Uri http://localhost:3000/authors -Method POST -Body (ConvertTo-Json @{ name = 'Homer' }) -ContentType 'application/json'
```

Conditional GET example (PowerShell/curl):
```powershell
curl -i http://localhost:3000/books
# copy ETag header value
curl -i -H "If-None-Match: <etag-value>" http://localhost:3000/books
# expect 304 when unchanged
```

## Example responses — 200 vs 304

Below are short, realistic examples showing the difference between a normal 200 OK response and a 304 Not Modified when the client supplies a matching `If-None-Match` header.

1) Successful GET (200 OK)

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
ETag: "d41d8cd98f00b204e9800998ecf8427e"
Cache-Control: public, max-age=60

[
	{ "id": "1", "title": "The Odyssey", "authorId": "a1" },
	{ "id": "2", "title": "Iliad", "authorId": "a2" }
]

2) Conditional GET when unchanged (304 Not Modified)

HTTP/1.1 304 Not Modified
ETag: "d41d8cd98f00b204e9800998ecf8427e"
Cache-Control: public, max-age=60

(no response body)
