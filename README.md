# DMS - Document Management System

Full-stack document management with auth, RBAC, document versioning, and categories.

- **Backend:** ASP.NET Core 8, EF Core, PostgreSQL, JWT
- **Frontend:** React 19, TypeScript, Vite, MUI

## Quick Start

```bash
docker compose up -d
```

- Frontend: http://localhost:3000
- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger

Default admin: `admin` / `admin123`

## Local Dev

```bash
cd DMS.Backend && dotnet run
cd DMS.Frontend && npm install && npm run dev
```
