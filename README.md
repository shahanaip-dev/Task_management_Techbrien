# TMT â€” Task Management Tool

A production-quality Project Management System built with **Node.js + TypeScript**, **Next.js App Router**, and **PostgreSQL**.

---

## Architecture Overview

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    FRONTEND (Next.js)                â”‚
â”‚  Pages: /login  /dashboard  /tasks                   â”‚
â”‚  Context â†’ Hooks â†’ API Client (Axios)                â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                      â”‚ HTTP/REST
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              BACKEND (Express + TypeScript)           â”‚
â”‚                                                      â”‚
â”‚  Routes â†’ Controllers â†’ Services â†’ Repositories     â”‚
â”‚                    â†“           â†“                     â”‚
â”‚            Zod Schemas    Prisma ORM                 â”‚
â”‚              (Validation)     â†“                      â”‚
â”‚                         PostgreSQL                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Clean Architecture Layers

| Layer          | Responsibility                                          |
|----------------|---------------------------------------------------------|
| **Routes**     | Map HTTP endpoints to controllers                       |
| **Controllers**| Parse request, call service, send response              |
| **Services**   | Business logic, orchestration, throws `AppError`        |
| **Repositories**| All DB queries via Prisma (single source of truth)     |
| **Schemas**    | Zod request validation â€” coerces and validates input    |
| **Middleware** | JWT auth, RBAC, validation, centralized error handler   |

---

## ER Diagram

```mermaid
erDiagram
    USERS {
        uuid   id          PK
        string name
        string email       UK
        string password
        enum   role        "ADMIN | DEVELOPER"
        date   created_at
    }

    PROJECTS {
        uuid   id          PK
        string name
        string description
        uuid   created_by  FK
        date   created_at
    }

    TASKS {
        uuid   id          PK
        string title
        string description
        enum   status      "TODO | IN_PROGRESS | DONE"
        uuid   project_id  FK
        uuid   assigned_to FK
        date   due_date
        date   created_at
    }

    USERS ||--o{ PROJECTS : "creates"
    USERS ||--o{ TASKS    : "is assigned"
    PROJECTS ||--o{ TASKS : "contains"
```

---

## Project Structure

```
Task_management_Techbrien/
â”œâ”€â”€ Tmt-server/               â† Express REST API
â”‚   â”œâ”€â”€ prisma/
â”‚   â”‚   â”œâ”€â”€ schema.prisma     â† DB schema
â”‚   â”‚   â””â”€â”€ seed.ts           â† Seed script
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ config/           â† Env config
â”‚   â”‚   â”œâ”€â”€ types/            â† TypeScript types
â”‚   â”‚   â”œâ”€â”€ utils/            â† JWT, bcrypt, pagination
â”‚   â”‚   â”œâ”€â”€ schemas/          â† Zod validation schemas
â”‚   â”‚   â”œâ”€â”€ middleware/       â† Auth, RBAC, error handler
â”‚   â”‚   â”œâ”€â”€ repositories/     â† Prisma data access
â”‚   â”‚   â”œâ”€â”€ services/         â† Business logic
â”‚   â”‚   â”œâ”€â”€ controllers/      â† HTTP handlers
â”‚   â”‚   â”œâ”€â”€ api/routes/       â† Express routes
â”‚   â”‚   â””â”€â”€ app.ts            â† Entry point
â”‚   â””â”€â”€ tests/                â† Jest unit tests
â”‚
â”œâ”€â”€ Tmt-web/                  â† Next.js App Router frontend
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ app/              â† Pages (login, dashboard, tasks)
â”‚       â”œâ”€â”€ components/       â† UI, layout, domain components
â”‚       â”œâ”€â”€ context/          â† AuthContext
â”‚       â”œâ”€â”€ hooks/            â† useProjects, useTasks
â”‚       â”œâ”€â”€ lib/              â† Axios client, auth helpers
â”‚       â””â”€â”€ types/            â† Shared TypeScript types
â”‚
â””â”€â”€ docker-compose.yml
```

---

## Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ (or Docker)

### 1. Database (Docker)

```bash
docker compose up db -d
```

Or point `DATABASE_URL` at an existing PostgreSQL instance.

### 2. Backend

```bash
cd Tmt-server
npm install
cp .env.example .env          # Fill in your values
npm run db:migrate               # Creates tables\nnpm run db:seed               # Creates admin user for login
npm run dev
# Server: http://localhost:5000
```

### 3. Frontend

```bash
cd Tmt-web
npm install
cp .env.example .env.local    # Set NEXT_PUBLIC_API_URL
npm run dev
# App: http://localhost:3000
```

### 4. Full stack with Docker

```bash
cp .env.example .env          # at root
docker compose up --build
```

### Default Credentials (after seed)

| Role  | Email         | Password  |\n|-------|---------------|-----------|\n| Admin | admin@tmt.com  | Admin@123 |

---

## API Endpoints

### Auth
| Method | Path              | Auth | Description           |
|--------|-------------------|------|-----------------------|
| POST   | /api/v1/auth/login| âœ—    | Login, receive JWT    |
| GET    | /api/v1/auth/me   | âœ“    | Get current user      |

### Users *(Admin only)*
| Method | Path           | Description        |
|--------|----------------|--------------------|
| POST   | /api/v1/users  | Create user        |
| GET    | /api/v1/users  | List users (paged) |

### Projects *(All authenticated)*
| Method | Path                | Description           |
|--------|---------------------|-----------------------|
| POST   | /api/v1/projects    | Create project        |
| GET    | /api/v1/projects    | List projects (paged) |
| GET    | /api/v1/projects/:id| Get project by ID     |
| PUT    | /api/v1/projects/:id| Update project        |
| DELETE | /api/v1/projects/:id| Delete project        |

### Tasks *(All authenticated)*
| Method | Path                      | Description                          |
|--------|---------------------------|--------------------------------------|
| POST   | /api/v1/tasks             | Create task                          |
| GET    | /api/v1/tasks             | List tasks (filter + paginate)       |
| GET    | /api/v1/tasks/:id         | Get task by ID                       |
| PUT    | /api/v1/tasks/:id         | Update task                          |
| PATCH  | /api/v1/tasks/:id/assign  | Assign task to user                  |
| DELETE | /api/v1/tasks/:id         | Delete task                          |

#### Task Filters (query params)
```
GET /api/v1/tasks?projectId=<uuid>&status=IN_PROGRESS&assignedTo=<uuid>&limit=10&cursor=<cursor>
```

---

## Running Tests

```bash
cd Tmt-server
npm test              # All unit tests
npm run test:coverage # With coverage report
```

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Node.js + TypeScript + Express          |
| ORM        | Prisma 5                                |
| Database   | PostgreSQL 16                           |
| Validation | Zod                                     |
| Auth       | JWT (jsonwebtoken) + bcryptjs           |
| Frontend   | Next.js 14 App Router + TypeScript      |
| Styling    | Tailwind CSS                            |
| HTTP Client| Axios                                   |
| Testing    | Jest + ts-jest                          |
| Container  | Docker + Docker Compose                 |

