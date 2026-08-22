-- Dayflow HRMS Database Schema

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'employee')) DEFAULT 'employee',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    mobile TEXT,
    email TEXT,
    personal_email TEXT,
    department TEXT,
    job_position TEXT,
    manager_id INTEGER,
    company TEXT,
    location TEXT,
    date_of_birth TEXT,
    address TEXT,
    gender TEXT,
    nationality TEXT,
    marital_status TEXT,
    pan_no TEXT,
    uan_no TEXT,
    emp_code TEXT,
    date_of_joining TEXT,
    profile_picture TEXT,
    about TEXT,
    job_love TEXT,
    hobbies TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bank_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    account_number TEXT,
    bank_name TEXT,
    ifsc_code TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS salary_structures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER UNIQUE NOT NULL,
    monthly_wage REAL NOT NULL DEFAULT 0,
    basic_salary_pct REAL NOT NULL DEFAULT 50.00,
    hra_pct REAL NOT NULL DEFAULT 50.00,
    standard_allowance_pct REAL NOT NULL DEFAULT 16.67,
    performance_bonus_pct REAL NOT NULL DEFAULT 8.33,
    lta_pct REAL NOT NULL DEFAULT 8.33,
    pf_employee_pct REAL NOT NULL DEFAULT 12.00,
    pf_employer_pct REAL NOT NULL DEFAULT 12.00,
    professional_tax REAL NOT NULL DEFAULT 200.00,
    working_days_per_week INTEGER NOT NULL DEFAULT 5,
    break_time_hours REAL NOT NULL DEFAULT 1.0,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    check_in TEXT,
    check_out TEXT,
    work_hours REAL DEFAULT 0,
    extra_hours REAL DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'half-day', 'leave')) DEFAULT 'present',
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leave_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    max_days_per_year INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    leave_type_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    allocation_days REAL NOT NULL DEFAULT 1,
    remarks TEXT,
    attachment TEXT,
    status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    approved_by INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    skill_name TEXT NOT NULL,
    proficiency TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    issuer TEXT,
    date TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    company_name TEXT NOT NULL DEFAULT 'Dayflow',
    logo_path TEXT,
    working_days_per_week INTEGER NOT NULL DEFAULT 5,
    break_time_hours REAL NOT NULL DEFAULT 1.0,
    public_holidays TEXT NOT NULL DEFAULT '[]'
);

-- Seed default leave types
INSERT OR IGNORE INTO leave_types (name, max_days_per_year) VALUES
    ('Paid Time Off', 24),
    ('Sick Leave', 7),
    ('Unpaid Leave', 0);

-- Seed default settings
INSERT OR IGNORE INTO settings (id, company_name, working_days_per_week, break_time_hours, public_holidays)
VALUES (1, 'Dayflow', 5, 1.0, '[
    {"date": "2026-01-14", "name": "Kite Festival"},
    {"date": "2026-01-26", "name": "Republic Day"},
    {"date": "2026-03-14", "name": "Holi"},
    {"date": "2026-04-02", "name": "Diwali"},
    {"date": "2026-08-15", "name": "Independence Day"},
    {"date": "2026-08-21", "name": "Rakhi"},
    {"date": "2026-10-02", "name": "Gandhi Jayanti"},
    {"date": "2026-10-03", "name": "Dussehra"},
    {"date": "2026-11-06", "name": "Diwali"},
    {"date": "2026-11-10", "name": "New Year"},
    {"date": "2026-11-11", "name": "Bhai Duj"}
]');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
