# TMT Task Management (Go + Next)

This repository hosts a Go-powered REST backend together with a Next.js App Router frontend that delivers a simplified yet production-looking task/project workspace tailored for Techbrien’s machine test. Authentication is handled via JWT, the UI is Tailwind-powered, and everything can run locally or via Docker Compose.

---

## Architecture

```
Task_management_Techbrien/
├── Tmt-server-go/     # Go backend (chi router + pgx + sqlx-style services)
│   ├── cmd/server/    # Entry point (`go run ./cmd/server`)
│   ├── internal/
│   │   ├── config/    # env + dotenv helpers
│   │   ├── http/      # handlers, middleware, router setup
│   │   ├── services/  # business logic (projects, tasks, users)
│   │   └── types/     # shared DTOs + enums
│   └── go.mod         # Go 1.22 module, dependencies like `chi`, `pgx`, `bcrypt`
├── Tmt-web/           # Next.js (App Router) TypeScript frontend
│   ├── src/
│   │   ├── app/        # Projects/Tasks/Users + root redirect + auth layout
│   │   ├── components/ # Cards, layout, buttons, modal
│   │   ├── context/    # AuthContext that exposes `user` + `isAdmin`
│   │   ├── hooks/      # data hooks (`useProjects`, `useTasks`, `useUsers`)
│   │   ├── lib/        # Axios client + auth helpers
│   │   └── types/      # Shared DTO definitions
│   ├── next.config.js
│   └── package.json
├── docker-compose.yml  # Spins up Go backend, PostgreSQL, and Next.js frontend
└── README.md           # This file
```

---

## Stack at a Glance

| Layer        | Technology                                 |
|--------------|--------------------------------------------|
| Backend      | Go 1.22 · Chi router · pgx/stdlib + bcrypt |
| Database     | PostgreSQL                                 |
| Frontend     | Next.js 14 App Router · Tailwind CSS       |
| HTTP Client  | Axios                                      |
| Auth         | JWT (custom middleware)                    |
| Container    | Docker Compose                             |

---

## Local Setup

### 1. PostgreSQL

Set `DATABASE_URL` in `Tmt-server-go/.env` (sample below) or use the compose service.

```
DATABASE_URL=postgres://postgres:password@localhost:5432/task_management?sslmode=disable
DB_USER=postgres
DB_PASSWORD=Fathima@123
DB_NAME=task_management
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=GFDSDFSDGHFJKHKGJHGDGHFgfgdghfgjgvcxgc
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### 2. Backend (Go)

```
cd Tmt-server-go
go mod tidy          # ensure go.sum matches imports
go run ./cmd/server  # runs on :5000
```

The server exposes `/api/v1/*` routes and enforces JWT via middleware. Create a user via `POST /api/v1/users` (admin only).

### 3. Frontend (Next.js)

```
cd Tmt-web
npm install
npm run dev          # http://localhost:3000
```

The frontend fetches from `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api/v1`). Login redirects to `/projects` and shows project/task dashboards with inline create/edit flows.

### 4. Full Stack via Docker

```
cp .env.example .env              # top-level env for compose
docker compose up --build
```

Services:
- `backend`: builds Go service from `Tmt-server-go`
- `frontend`: builds Next.js app
- `db`: PostgreSQL

---

## Key Experiences

- **Projects tab**: search by name, quick create form, project cards include view/edit/delete (edit/delete only for admins), pagination limit 8 items per page, 4-column grid.
- **Tasks tab**: filters by title/project/due date, inline create form, cards show status badges + edit/view icons, pagination limit 8 as well.
- **Team tab (admin only)**: list of non-admin users, inline create/edit/delete for team members (admin itself hidden from list).
- **Change password modal**: available in sidebar for any user (requests `PATCH /users/me/password`).

---

## API Reference

### Auth

| Method | Path                 | Description             |
|--------|----------------------|-------------------------|
| POST   | `/api/v1/auth/login`  | Authenticate and receive JWT |
| GET    | `/api/v1/auth/me`     | Current user profile     |

### Users (admin only)

| Method | Path                | Description                   |
|--------|---------------------|-------------------------------|
| GET    | `/api/v1/users`      | List users (cursor pagination, returns admins + employees) |
| POST   | `/api/v1/users`      | Create user (admin)            |
| PUT    | `/api/v1/users/:id`  | Update user                    |
| DELETE | `/api/v1/users/:id`  | Delete user                    |
| PATCH  | `/api/v1/users/me/password` | Change own password        |

### Projects

| Method | Path                        | Description           |
|--------|-----------------------------|-----------------------|
| GET    | `/api/v1/projects`           | List projects (supports `limit`, `name`) |
| POST   | `/api/v1/projects`           | Create project        |
| GET    | `/api/v1/projects/:id`       | View project          |
| PUT    | `/api/v1/projects/:id`       | Update project (admin only) |
| DELETE | `/api/v1/projects/:id`       | Delete project (admin only) |

### Tasks

| Method | Path                         | Description           |
|--------|------------------------------|-----------------------|
| GET    | `/api/v1/tasks`               | List tasks (supports `limit`, filters) |
| POST   | `/api/v1/tasks`               | Create task            |
| GET    | `/api/v1/tasks/:id`           | View task              |
| PUT    | `/api/v1/tasks/:id`           | Update task            |
| PATCH  | `/api/v1/tasks/:id/assign`    | Assign user to task    |
| DELETE | `/api/v1/tasks/:id`           | Delete task            |

---

## Default Admin Credentials

| Role  | Email           | Password   |
|-------|-----------------|------------|
| Admin | admin@techbrien | Admin@123  |
