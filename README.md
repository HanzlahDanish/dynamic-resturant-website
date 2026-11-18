# Dynamic Restaurant Website

A database-powered restaurant website built using Next.js, TypeScript, Tailwind CSS, and NeonDB PostgreSQL.

## Features

- Dynamic menu fetched from NeonDB.
- Add new menu items.
- Delete existing menu items.
- Persistent database storage.
- Responsive restaurant interface.
- Real-time menu updates after operations.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- NeonDB PostgreSQL
- React Hooks (useState, useEffect)
- Next.js API Route Handlers
- Fetch API

## Project Structure

```text
dynamic-restaurant-website/
├── src/
│   └── app/
│       ├── api/
│       │   └── menu/
│       │       └── route.ts
│       ├── page.tsx
│       └── globals.css
├── .env.local
├── .gitignore
├── package.json
└── README.md
```

## Installation

1. Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

2. Navigate into the project:

```bash
cd dynamic-restaurant-website
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env.local` file in the root directory:

```env
DATABASE_URL="YOUR_NEON_DATABASE_URL"
```

5. Create the database table in NeonDB:

```sql
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    description TEXT
);
```

6. Start the development server:

```bash
npm run dev
```

7. Open http://localhost:3000

## Database

The application uses NeonDB PostgreSQL to store restaurant menu items.

Table: `menu_items`

| Column | Type |
|---|---|
| id | SERIAL PRIMARY KEY |
| name | VARCHAR(150) |
| price | NUMERIC(10,2) |
| description | TEXT |

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/menu | Fetch menu items |
| POST | /api/menu | Add menu item |
| DELETE | /api/menu | Delete menu item |

## Security

The database connection string is stored in `.env.local` and must never be committed to GitHub.

## Project Purpose

This project demonstrates database integration, API route handling, React state management, and dynamic data operations using Next.js and NeonDB.

## Author

Developed as a practical Next.js + NeonDB assignment.