# Dayflow — Human Resource Management System

> Every workday, perfectly aligned.

A full-stack HRMS built with Node.js, Express, React, and Material UI. Manages employee onboarding, attendance tracking, leave management, and Indian payroll computation.

## Screenshots

### Admin View

**Employee Dashboard** — stat cards, employee grid with live status indicators, search
![Admin Dashboard](web_site_images/Screenshot%202026-08-22%20210803.png)

**Admin Profile** — full access with Resume, Private Info, Salary Info, Security tabs
![Admin Profile](web_site_images/Screenshot%202026-08-22%20210814.png)

**Attendance (Admin)** — view all employees' check-in/out for any date
![Admin Attendance](web_site_images/Screenshot%202026-08-22%20210851.png)

**Time Off (Admin)** — leave balances, approve/reject pending requests
![Admin Time Off](web_site_images/Screenshot%202026-08-22%20210842.png)

### Employee View

**Time Off (Employee)** — 12-month calendar with color-coded leave days, public holidays sidebar
![Employee Time Off](web_site_images/Screenshot%202026-08-22%20210926.png)

**Employee Profile** — own profile with Resume, Private Info, Security tabs (no Salary tab)
![Employee Profile](web_site_images/Screenshot%202026-08-22%20210949.png)

---

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
- **Attendance** — Check-in/out with break tracking, confirm & lock, daily & monthly views
- **Leave Management** — Request/approve/reject workflow, 12-month calendar, balance tracking
- **Payroll** — Indian salary structure: Basic, HRA, LTA, PF (12%+12%), Professional Tax
- **Role-Based Access** — Employees see limited info about others; admins see everything
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
├── web_site_images/         # Application screenshots
├── exccalidraw_diagrams/    # UI wireframe screenshots
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

# Set up environment (copy and edit if needed)
cp server/.env.example server/.env

# Run both servers (database auto-creates on first run)
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
| Attendance | `POST /check-in`, `/check-out`, `/break/start`, `/break/end`, `/confirm`, `/resume` |
| Leave | `GET /types`, `POST /request`, `GET /my`, `/all`, `PUT /:id/approve`, `/:id/reject` |
| Payroll | `GET/PUT /api/payroll/:employee_id`, `GET /:employee_id/compute` |
| Settings | `GET/PUT /api/settings`, `POST /logo` |

## Attendance Flow

```
Check In → Break → Resume → End Day → Continue Working / Confirm & Lock
```

- **Check In** — starts the timer
- **Break** — pauses (tracks total break duration)
- **Resume** — back to working after break
- **End Day** — calculates work hours (total time minus breaks)
- **Continue Working** — not done yet, go back
- **Confirm & Lock** — finalizes attendance for the day

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
