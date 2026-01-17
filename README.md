# Group-7-Distributed-Systems-and-Web-Architecture
Group 7 Distributed Systems and Web Architecture

## Library API (Project folder added)

This repository now contains a small Library Management RESTful API in the `src/` folder. The API uses MySQL (MariaDB) for persistence and includes migration SQL and scripts.

Quick setup (PowerShell, Windows + XAMPP/MariaDB):

1. Change to the project folder and install Node dependencies:

```powershell
cd "C:\Users\LabStudent\Desktop\kwizera assignment\Group-7-Distributed-Systems-and-Web-Architecture"
npm install
```

2. Configure environment (XAMPP/MariaDB default `root` user with empty password):

Option A — create a `.env` file from the example (recommended):

```powershell
Copy-Item .\.env.example .\.env
# Then edit .env if needed. The example uses an empty DB_PASSWORD for XAMPP default installs.
```

Option B — set environment variables for the current PowerShell session (temporary):

```powershell
$env:DB_HOST='127.0.0.1'
$env:DB_PORT='3306'
$env:DB_USER='root'
$env:DB_PASSWORD=''
$env:DB_NAME='library'
```

3. Run migrations to create the `library` database and tables:

```powershell
npm run migrate
# or: node scripts/migrate.js
```

4. Start the API server:

```powershell
npm start
```

5. Run the benchmark (optional):

```powershell
npm run benchmark
```

Notes:
- The DB client loads `.env` automatically via `dotenv` and falls back to sensible defaults (root user, empty password) which match a common XAMPP local setup.
- You can also apply the SQL directly with the MySQL CLI:

```powershell
mysql -h 127.0.0.1 -P 3306 -u root -p < .\sql\create_library.sql
```

If you want, I can also add a `.gitignore` entry for `.env` and commit these changes for you.
