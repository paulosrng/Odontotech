# Odontotech — Backend API

Production-ready REST API for the **Odontotech** dental clinic management system.
Built with **Node.js + TypeScript + Express + Prisma + SQLite + JWT + Zod + Multer**.

> SQLite stores everything in a single file (`prisma/dev.db`) — **no database server required**. Works out of the box.

---

## 🚀 Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts        # or: npm run seed
npm run dev
```

The API starts at **http://localhost:4000**.

Copy `.env.example` to `.env` (a working `.env` is already included for local dev):

```env
PORT=4000
DATABASE_URL="file:./dev.db"
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
CORS_ORIGIN="http://localhost:5173"
```

### Default credentials (created by the seed)

| Role    | E-mail                              | Password   |
|---------|-------------------------------------|------------|
| ADMIN   | `admin@odontotech.com`              | `admin123` |
| ADMIN   | `marina.costa@odontotech.com.br`    | `demo1234` |
| DENTIST | `rafael.lima@odontotech.com.br` …   | `demo1234` |

---

## 🧱 Architecture

Strict separation of concerns: **routes → controllers → services → Prisma**.

```
backend/
├── prisma/
│   ├── schema.prisma          # SQLite provider
│   └── seed.ts                # realistic dummy data (47 patients, etc.)
├── src/
│   ├── config/env.ts          # dotenv config
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # JWT validation + role guard
│   │   ├── error.middleware.ts # Prisma / Zod / JWT / Multer → HTTP
│   │   └── upload.middleware.ts# Multer (saves to /uploads)
│   ├── modules/
│   │   ├── auth/  patients/  appointments/  services/
│   │   ├── plans/ exams/  dental-records/  config/
│   │   └── (each: router.ts · controller.ts · service.ts · schema.ts · types.ts)
│   ├── shared/  (prisma.ts · response.ts · errors.ts · dates.ts · …)
│   ├── app.ts   # express assembly
│   └── server.ts
└── uploads/     # uploaded exam files
```

### Response envelopes

```jsonc
// success
{ "success": true, "data": { ... }, "message": "..." }

// list (paginated)
{ "success": true, "data": [ ... ], "total": 47, "page": 1, "totalPages": 5 }

// error
{ "success": false, "message": "...", "error": ... }
```

All list endpoints accept `?page=` & `?limit=`.

---

## 📡 Endpoints

### Auth
| Method | Path            | Notes                                       |
|--------|-----------------|---------------------------------------------|
| POST   | `/auth/login`   | `{ email, password }` → access + refresh    |
| POST   | `/auth/refresh` | `{ refreshToken }` → rotated pair           |
| POST   | `/auth/logout`  | `{ refreshToken }` → revokes token          |
| GET    | `/auth/me`      | current user (auth)                         |

Access token = **15 min**, refresh token = **7 days** (persisted in DB & rotated).

### Patients
| Method | Path                  | Notes |
|--------|-----------------------|-------|
| GET    | `/patients`           | `?search=`, `?status=`, `?planId=`, `?sort=`, `?dir=`, paginated |
| POST   | `/patients`           | |
| GET    | `/patients/:id`       | full detail + last appointments + exams |
| PUT    | `/patients/:id`       | |
| DELETE | `/patients/:id`       | |

### Appointments
| Method | Path                          | Notes |
|--------|-------------------------------|-------|
| GET    | `/appointments`               | `?date=`, `?dentistId=`, `?status=`, paginated |
| GET    | `/appointments/agenda`        | `?start=YYYY-MM-DD&end=YYYY-MM-DD[&dentistId=]` |
| POST   | `/appointments`               | accepts `datetime` OR `date`+`time` |
| GET    | `/appointments/:id`           | |
| PUT    | `/appointments/:id`           | |
| PATCH  | `/appointments/:id/status`    | `{ status }` |
| DELETE | `/appointments/:id`           | |
| POST   | `/appointments/:id/services`  | attach services (`Associar à consulta`) |

### Services
`GET /services` · `POST /services` · `PUT /services/:id` · `DELETE /services/:id`

### Plans
`GET /plans` · `POST /plans` · `PUT /plans/:id` · `DELETE /plans/:id`

### Exams
| Method | Path                     | Notes |
|--------|--------------------------|-------|
| GET    | `/exams`                 | global list, `?search=`, `?status=` |
| GET    | `/patients/:id/exams`    | per patient |
| POST   | `/patients/:id/exams`    | **multipart/form-data** (`files` field, up to 10) |
| PUT    | `/exams/:id`             | multipart (append files) |
| DELETE | `/exams/:id`             | |

### Dental records (prontuário)
`GET /patients/:id/dental-record` · `PUT /patients/:id/dental-record`

### Config (system settings + users) — **the previously-missing piece**
| Method | Path                  | Auth   |
|--------|-----------------------|--------|
| GET    | `/config`             | any    |
| PUT    | `/config`             | ADMIN  |
| GET    | `/config/dentists`    | any (dropdowns) |
| GET    | `/config/users`       | ADMIN  |
| POST   | `/config/users`       | ADMIN  |
| PUT    | `/config/users/:id`   | ADMIN  |
| DELETE | `/config/users/:id`   | ADMIN  |
| GET    | `/dentists`           | any (alias) |

---

## 🔌 Frontend integration

The current frontend (`Odontotech.html` + `*.jsx`) is a **static prototype** that reads
from `window.DATA` and performs **no real HTTP requests**. To connect it to this API:

1. **Base URL** — there is no `VITE_API_URL` / `REACT_APP_API_URL` yet. Add one:
   - Vite: `VITE_API_URL=http://localhost:4000`
   - CRA:  `REACT_APP_API_URL=http://localhost:4000`
2. **CORS** — already configured via `CORS_ORIGIN` (default `http://localhost:5173`,
   Vite's dev port). Change it if your frontend runs elsewhere.
3. **Auth flow** — replace the mock `onLogin()` in `screens_landing.jsx` with a call to
   `POST /auth/login`; store the `accessToken` and send it as `Authorization: Bearer <token>`.
4. **Field shapes** — every DTO returned by this API includes both the canonical field
   **and the frontend alias** (e.g. patient `birth`+`birthdate`, `obs`+`observations`,
   service `cat`+`category`, `dur`+`duration`, plan `coverage`+`coveragePercent`,
   `carencia`+`gracePeriod`), so existing components work without renaming.

### ⚠️ Shape mismatches to be aware of
- Frontend uses **string ids** like `pt1`, `d1`, `s1`, `p1`. This API generates `cuid`
  ids. Swap any hard-coded id references for values returned by the API.
- Frontend appointments store `date` + `hour` + `min` + `dur`. The API stores a single
  `datetime` but **also returns** `date`, `hour`, `min`, `dur` for compatibility.
- `allergies`/`conditions` are returned as **arrays** (stored as JSON in SQLite).
- Dentists are **Users** with `role = "DENTIST"`; fetch them from `/config/dentists`
  (the response includes `spec` to match the frontend `dentist.spec`).

---

## 🛠️ Scripts

| Script              | Description                          |
|---------------------|--------------------------------------|
| `npm run dev`       | start with hot reload (ts-node-dev)  |
| `npm run build`     | compile TypeScript → `dist/`         |
| `npm start`         | run compiled build                   |
| `npm run seed`      | populate the database                |
| `npm run db:reset`  | reset DB + re-run migrations + seed  |
| `npm run prisma:studio` | open Prisma Studio               |
