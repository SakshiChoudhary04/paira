# Paira — Finance Tracker (MERN Stack)

A full-stack personal finance tracker built with MongoDB, Express, React, and Node.js — featuring JWT authentication, account management, transaction tracking, and budget monitoring.

---

## Project Structure

```
paira/
├── server/               # Express + MongoDB backend
│   ├── index.js          # Entry point
│   ├── models/
│   │   ├── User.js       # User schema + bcrypt hashing
│   │   ├── Account.js    # Financial account schema
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js       # Register, login, /me, update profile/password
│   │   ├── accounts.js   # CRUD for accounts
│   │   └── transactions.js # CRUD for transactions + summary
│   ├── middleware/
│   │   └── auth.js       # JWT protect middleware
│   └── .env.example
│
└── client/               # React frontend
    └── src/
        ├── context/
        │   ├── AuthContext.js    # User auth state + login/register/logout
        │   └── FinanceContext.js # Accounts + transactions data
        ├── components/
        │   ├── AppLayout.js      # Main shell with sidebar + topbar
        │   ├── Sidebar.js        # Navigation
        │   ├── TransactionModal.js
        │   ├── AccountModal.js
        │   └── Toast.js
        ├── pages/
        │   ├── Dashboard.js      # Summary, budget bar, recent transactions
        │   ├── Transactions.js   # Filterable transaction list
        │   ├── Accounts.js       # Account cards with stats
        │   ├── Settings.js       # Profile + password update
        │   ├── Login.js
        │   └── Register.js
        └── utils/
            ├── api.js            # Axios instance with auth interceptors
            └── helpers.js        # Formatters + constants
```

---

## Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

---

## Quick Start

### 1. Install dependencies

```bash
# From the paira/ root directory
npm install           # installs concurrently
npm run install:all   # installs server + client deps
```

Or manually:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure the server

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/paira
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Run in development

From the root `paira/` directory:
```bash
npm run dev
```

This starts:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:3000` (proxied to backend)

Or run separately:
```bash
npm run dev:server
npm run dev:client
```

---

## API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/auth/me` | Get current user (protected) |
| PUT | `/api/auth/profile` | Update name/currency (protected) |
| PUT | `/api/auth/password` | Change password (protected) |

### Accounts (all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounts` | List all accounts |
| POST | `/api/accounts` | Create account |
| PUT | `/api/accounts/:id` | Update account |
| DELETE | `/api/accounts/:id` | Delete account + its transactions |
| GET | `/api/accounts/:id/stats` | Income/expense stats for account |

### Transactions (all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List transactions (supports `?month=&year=&type=&account=`) |
| GET | `/api/transactions/summary` | Monthly income/expense/category summary |
| POST | `/api/transactions` | Create transaction (auto-updates account balance) |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction (reverses balance) |

---

## Authentication Flow

1. User registers/logs in → receives JWT
2. JWT stored in `localStorage` as `paira_token`
3. Axios interceptor attaches `Authorization: Bearer <token>` to all requests
4. 401 responses automatically redirect to `/login` and clear storage
5. Protected routes check auth state from `/api/auth/me` on mount

---

## Features

- **Dashboard** — Net balance, income, spent, total across accounts, budget progress bar, top spending categories, recent transactions
- **Transactions** — Full list with search and filter by type (income / expense / transfer)
- **Accounts** — Per-account cards showing balance, income, expense totals, recent transactions
- **Settings** — Update profile name, change password
- **Auth** — Register, login, JWT-protected API, auto-logout on 401
- **Month navigation** — Browse any month's data via topbar arrows
- **Budget tracking** — Set salary on account → auto-generates income tx and tracks budget %
- **Transfer type** — Move money between accounts

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | MongoDB + Mongoose |
| Backend | Node.js + Express |
| Authentication | JWT + bcryptjs |
| Frontend | React 18 + React Router v6 |
| HTTP Client | Axios |
| Styling | Plain CSS (custom design system matching original Paira HTML) |

---

## Production Deployment

### Build the React app:
```bash
npm run build --prefix client
```

### Serve static files from Express (add to `server/index.js`):
```js
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}
```

Then deploy to Railway, Render, Fly.io, or any Node.js host with a MongoDB Atlas connection string.
