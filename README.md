# Salary Management System — Frontend

A modern, responsive HR dashboard built with React, TypeScript, and Vite. Provides employee management, salary analytics visualizations, and role-based access control.

## Tech Stack

- **React** 19 + **TypeScript** 6
- **Vite** 8 — Build tool and dev server
- **Tailwind CSS** 4 — Utility-first styling
- **ShadCN UI** — Accessible component library
- **React Router** 7 — Client-side routing with protected routes
- **TanStack Query** 5 — Server state management with caching
- **React Hook Form** + **Zod** — Form handling with schema validation
- **Recharts** 3 — Data visualization (bar charts, line charts, histograms)
- **Lucide React** — Icon library
- **Axios** — HTTP client with interceptors

## Features

- JWT authentication with automatic token refresh
- Role-based UI (Admin, HR_Manager, Viewer) — write actions hidden for read-only users
- Employee CRUD with paginated data table, search, filters, and sorting
- Analytics dashboard with summary cards and 4 interactive charts
- Dark/light mode with persistent preference
- Responsive layout (320px to 1920px) with collapsible sidebar
- Form validation matching backend rules with inline error display
- Toast notifications for success/error feedback
- Loading skeletons and error states with retry

---

## Setup Instructions

### Prerequisites

| Tool    | Version | Check Command      |
|---------|---------|-------------------|
| Node.js | 18+     | `node --version`  |
| npm     | 9+      | `npm --version`   |

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

### 5. Verify Setup

Open http://localhost:5173 in your browser. You should see the login page. Make sure the backend is running at the configured `VITE_API_BASE_URL`.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

---

## Running Tests

```bash
# Run all tests
npm run test

# Run in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage
npm run test:coverage

# Run a specific test file
npx vitest --run src/__tests__/validations.test.ts
```

**Test suite includes:**
- Zod validation schema tests (6 tests)
- Login page rendering and behavior (4 tests)
- Dashboard component with mocked data (3 tests)
- Employee list table states (4 tests)
- Property-based tests with fast-check (3 tests)

---

## Project Structure

```
frontend/
├── src/
│   ├── api/                    # API layer
│   │   ├── client.ts           # Axios instance + interceptors + token management
│   │   ├── auth.ts             # Auth API functions (login, logout, refresh, register)
│   │   ├── employees.ts        # Employee CRUD API functions
│   │   └── analytics.ts        # Analytics API functions
│   ├── components/
│   │   ├── ui/                 # ShadCN UI components (Button, Card, Input, Table, etc.)
│   │   ├── forms/
│   │   │   └── EmployeeForm.tsx  # Shared create/edit form with Zod validation
│   │   └── layout/
│   │       ├── AppLayout.tsx     # Sidebar + main content layout
│   │       └── ProtectedRoute.tsx # Auth + role guard
│   ├── context/
│   │   ├── AuthContext.tsx     # Auth state, login/logout, role helpers
│   │   └── ThemeContext.tsx    # Dark/light mode with localStorage persistence
│   ├── hooks/
│   │   ├── useEmployees.ts    # Employee list + delete mutation hooks
│   │   ├── useEmployee.ts     # Single employee + create/update mutation hooks
│   │   └── useAnalytics.ts    # Dashboard, payroll, distribution hooks
│   ├── lib/
│   │   ├── utils.ts           # cn() utility for class merging
│   │   └── validations/
│   │       └── employee.ts    # Zod schema for employee form
│   ├── pages/
│   │   ├── LoginPage.tsx      # Login form with validation
│   │   ├── DashboardPage.tsx  # Analytics cards + charts
│   │   ├── EmployeeListPage.tsx # Data table with search/filter/sort/pagination
│   │   ├── EmployeeCreatePage.tsx
│   │   └── EmployeeEditPage.tsx
│   ├── routes/
│   │   └── index.tsx          # App router with protected routes
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces for all API types
│   ├── __tests__/             # Test files
│   ├── App.tsx                # Root component (providers + router)
│   ├── main.tsx               # Entry point
│   └── index.css              # Tailwind + design tokens + dark mode
├── public/
├── .env                       # Environment variables
├── vite.config.ts             # Vite + Vitest configuration
├── tsconfig.json              # TypeScript configuration
├── components.json            # ShadCN UI configuration
└── package.json
```

---

## Key Architecture Decisions

### Token Storage
Tokens are stored in memory (module-level variables in `client.ts`), not in localStorage or sessionStorage. This prevents XSS attacks from accessing tokens. Trade-off: users must re-login after page refresh.

### API Layer
All API calls go through a centralized Axios instance with:
- **Request interceptor** — Injects `Authorization: Bearer <token>` header
- **Response interceptor** — Catches 401, attempts silent token refresh, retries the original request. On refresh failure, redirects to `/login`.

### State Management
- **Server state** — TanStack Query handles caching, background refetching, and cache invalidation
- **Auth state** — React Context (AuthContext)
- **Theme state** — React Context (ThemeContext) with localStorage persistence
- **Local UI state** — useState for search input, filters, pagination, sort

### Form Validation
Zod schemas mirror backend validation rules exactly:
- All required fields enforced
- Salary ≥ 0
- Valid email format
- Employment type and status enums
- API 400 errors mapped back to form fields

---

## Production Build

```bash
# Build for production
VITE_API_BASE_URL=https://your-api-domain.com npm run build

# Output in dist/ — serve with any static file server
npx serve dist
```

The build produces minified, tree-shaken output. Serve the `dist/` directory with Nginx, Caddy, S3+CloudFront, or any static hosting.

---

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank page after login | Ensure backend is running at the configured `VITE_API_BASE_URL` |
| CORS errors | Check backend `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173` |
| Build fails | Run `npm install` to ensure all dependencies are installed |
| Tests fail | Run `npm install` then `npm run test` — ensure no stale cache |
