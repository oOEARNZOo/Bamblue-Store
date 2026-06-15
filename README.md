# Bamblue Store

Full-stack K-fashion e-commerce web application built with Next.js, React, Tailwind CSS, and Supabase.

Bamblue Store is a boutique-style shopping platform focused on product discovery, size-based stock, cart and wishlist flows, checkout, order tracking, customer reviews, and admin management tools.

## Live Demo

- Live site: https://bamblue-store.vercel.app/
- GitHub: https://github.com/oOEARNZOo/Bamblue-Store

## Tech Stack

- **Framework:** Next.js 14, React 18
- **Styling:** Tailwind CSS
- **Backend / Database:** Supabase Auth, Supabase Database, PostgreSQL RPC
- **UI / UX:** Framer Motion, Lucide React, React Hot Toast
- **Deployment:** Vercel

## Key Features

### Customer Storefront

- Responsive fashion e-commerce homepage with product banners and product sections
- Product listing with search, category filtering, sorting, pagination, sale badges, and stock status
- Product detail page with image gallery, zoom interaction, related products, size guide, and share link
- Size-based product stock for `S`, `M`, `L`, and `XL`
- Cart system with quantity controls, stock limit validation, and localStorage persistence
- Wishlist flow with login-aware user feedback
- Checkout form with validation for customer, address, phone, zipcode, and payment method
- PromptPay QR payment flow and order confirmation state
- User order history with order status and tracking support
- Customer review system with verified-purchase logic and helpful votes

### Admin Tools

- Admin dashboard with product, order, user, revenue, review, and stock overview
- Product management with create/edit/delete flows, product images, categories, sale pricing, and size stock
- Order management with search, filtering, status updates, payment status, and order detail modal
- Review management for approving and moderating customer reviews
- Admin access checks using Supabase Auth metadata and `admin_users` table

### Backend / Database

- Protected checkout API route with Bearer token validation
- Supabase RPC checkout flow for creating orders and order items
- Idempotency key handling to prevent duplicate checkout submissions
- Atomic stock validation and stock deduction
- Sale-price calculation aligned between product display and checkout totals
- Supabase migrations for orders, reviews, admin users, RLS policies, indexes, stock fields, payment columns, and checkout functions

## Project Structure

```txt
bamblue-store/
├── public/                  # Static assets and product images
├── src/
│   ├── app/                 # Next.js App Router pages and API routes
│   │   ├── api/             # Backend API routes
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── products/        # Product listing page
│   │   ├── product/[id]/    # Product detail page
│   │   ├── checkout/        # Checkout page
│   │   ├── orders/          # Customer order history
│   │   └── page.jsx         # Home page
│   ├── frontend/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Cart and wishlist providers
│   │   ├── services/        # Supabase client setup
│   │   ├── utils/           # Validation and toast helpers
│   │   └── auth/            # Admin/auth helpers
│   └── backend/
│       └── supabase/        # Server-side Supabase helper
├── supabase/
│   └── migrations/          # Database schema, RLS, indexes, and RPC functions
├── package.json
└── README.md
```

## Main Routes

| Route | Description |
| --- | --- |
| `/` | Homepage with hero banner, new arrivals, best sellers, and reviews |
| `/products` | Product listing with filters, search, sorting, and pagination |
| `/product/[id]` | Product detail, size selection, stock status, reviews, and related products |
| `/cart` | Cart review and quantity management |
| `/checkout` | Checkout form, payment method, and order creation |
| `/orders` | Customer order history |
| `/wishlist` | Saved products |
| `/admin` | Admin dashboard |
| `/admin/products` | Product management |
| `/admin/orders` | Order management |
| `/admin/reviews` | Review moderation |

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/oOEARNZOo/Bamblue-Store.git
cd Bamblue-Store
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit real secret keys. If you add server-only secrets later, keep them outside public client code and outside Git.

### 4. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Available Scripts

```bash
npm run dev      # Start local development server
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run Next.js lint
```

## Database Notes

The project uses Supabase migrations under `supabase/migrations`.

Important database features include:

- `orders` and `order_items` tables
- `reviews` and `review_helpful` tables
- `admin_users` table
- Row Level Security policies
- Checkout RPC function
- Payment confirmation RPC function
- Size-based stock fields
- Performance indexes

Run the migrations in your Supabase project before using checkout, orders, reviews, and admin features.

## What I Practiced

This project was built to practice real-world frontend and full-stack product workflows:

- Building a complete e-commerce user journey
- Structuring a Next.js App Router project
- Managing shared state with React Context
- Designing responsive product and checkout UI
- Integrating Supabase Auth and Database
- Writing protected API routes
- Handling order creation, validation, and stock consistency
- Building admin workflows for products, orders, and reviews

## Screenshots

Recommended screenshots to add:

- Homepage
- Product listing
- Product detail
- Cart and checkout
- Admin dashboard
- Product management

## Author

**Chanatip Tonngern**  
Junior Frontend Developer

- Portfolio: https://portfolio-web-three-wheat.vercel.app/
- GitHub: https://github.com/oOEARNZOo
- LinkedIn: https://www.linkedin.com/in/chanatip-tonngern-698941364/
