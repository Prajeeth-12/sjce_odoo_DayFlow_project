# Dayflow — Human Resource Management System

> Every workday, perfectly aligned.

A full-stack HRMS built with Node.js, Express, React, and Material UI. Manages employee onboarding, attendance tracking, leave management, and Indian payroll computation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Material UI v9 + Framer Motion |
| Backend | Node.js + Express |
| Database | SQLite (sql.js) |
| Auth | JWT (access + refresh tokens) |

## Features

- **Authentication** — Admin signup, employee login with auto-generated IDs (format: `OIJODO20220001`)
- **Employee Management** — CRUD, profile with 4 tabs (Resume, Private Info, Salary, Security)
- **Attendance** — Real-time check-in/out, daily & monthly views, work hours computation
- **Leave Management** — Request/approve/reject workflow, balance tracking, 3 leave types
- **Payroll** — Indian salary structure: Basic, HRA, LTA, PF (12%+12%), Professional Tax
- **Premium UI** — Sidebar navigation, animated cards, skeleton loaders, page transitions

## Project Structure

```
├── client/                  # React frontend
│   └── src/
│       ├── design/          # Design system (tokens, theme, shared components)
│       ├── pages/           # Auth, Dashboard, Profile, Attendance, TimeOff, Settings
│       ├── components/      # Layout (AppShell, Sidebar)
│       ├── context/         # AuthContext
│       └── services/        # API client (axios)
├── server/                  # Express backend
│   └── src/
│       ├── modules/         # auth, employees, attendance, leave, payroll, settings
│       ├── middleware/      # JWT auth guard, role guard
│       ├── database/        # Schema, db layer (sql.js)
│       └── utils/           # Login ID generator, password generator
├── package.json             # Root (concurrently runs both)
└── odoo.db                  # SQLite database (auto-created on first run)
```

## Quick Start

```bash
# Install all dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..

# Run both servers
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## First Run

1. Open http://localhost:5173 → Sign Up page
2. Register as Admin (enter company name, name, email, password)
3. You'll get a generated Login ID (e.g., `ODPRKU20260001`)
4. Create employees from the dashboard → system generates their credentials
5. Employees log in and can check-in, request leave, view profile

## API Endpoints

| Module | Routes |
|--------|--------|
| Auth | `POST /api/auth/signup`, `/signin`, `/refresh`, `/change-password`, `GET /me` |
| Employees | `GET/POST /api/employees`, `GET/PUT/DELETE /:id`, `/search` |
| Attendance | `POST /check-in`, `/check-out`, `GET /my`, `/all`, `/summary`, `/status` |
| Leave | `GET /types`, `POST /request`, `GET /my`, `/all`, `PUT /:id/approve`, `/:id/reject` |
| Payroll | `GET/PUT /api/payroll/:employee_id`, `GET /:employee_id/compute` |
| Settings | `GET/PUT /api/settings`, `POST /logo` |

## Salary Computation (Indian Payroll)

For a ₹50,000 monthly wage:
- Basic Salary: ₹25,000 (50% of wage)
- HRA: ₹12,500 (50% of basic)
- Standard Allowance: ₹4,167.50 (16.67% of basic)
- Performance Bonus: ₹2,082.50 (8.33% of basic)
- LTA: ₹2,082.50 (8.33% of basic)
- Fixed Allowance: ₹4,167.50 (remainder)
- PF Employee: ₹3,000 (12% of basic)
- PF Employer: ₹3,000 (12% of basic)
- Professional Tax: ₹200/month (fixed)

## License

Built for SJCE Odoo Internship Project.
