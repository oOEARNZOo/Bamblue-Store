# Bamblue Store Project Structure

This project uses Next.js App Router, so routes must stay in `src/app`.
The code is organized into frontend, backend, and database areas like this:

```txt
bamblue-store/
├─ public/                         # Static assets served by Next.js
├─ src/
│  ├─ app/                         # Next.js routing layer
│  │  ├─ api/                      # Backend API routes
│  │  ├─ admin/                    # Admin pages
│  │  ├─ products/                 # Store pages
│  │  ├─ checkout/                 # Checkout page
│  │  ├─ layout.jsx                # Root layout
│  │  └─ page.jsx                  # Home page
│  ├─ frontend/                    # Frontend-only reusable code
│  │  ├─ auth/                     # Client-side admin/auth helpers
│  │  ├─ components/               # Reusable UI components
│  │  ├─ context/                  # React state providers
│  │  ├─ data/                     # Static frontend data
│  │  ├─ services/                 # Browser-safe service clients
│  │  └─ utils/                    # Frontend helper functions
│  └─ backend/                     # Server-only reusable code
│     └─ supabase/                 # Supabase server helpers
├─ supabase/
│  └─ migrations/                  # Database schema, RLS, and RPC SQL
├─ package.json
└─ README.md
```

## Frontend

Frontend files handle UI, browser state, form validation, toast messages, and browser-safe Supabase calls.

Main folders:

- `src/frontend/components`
- `src/frontend/context`
- `src/frontend/services`
- `src/frontend/utils`

## Backend

Backend files handle API routes, server-side validation, and protected server helpers.

Main folders:

- `src/app/api`
- `src/backend`

Important rule: API route files must stay under `src/app/api` because Next.js uses this folder to create HTTP endpoints.

## Database

Database files handle tables, policies, indexes, and RPC functions.

Main folder:

- `supabase/migrations`

For important flows like checkout, the frontend should call a backend API route, and the backend should call a database RPC or secured query.
