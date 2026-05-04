# qb-tools

Full-stack QuickBooks Online bulk invoice creator. Create weekly invoices in batch with a timesheet-style interface, then commit them to QuickBooks as drafts.

## Tech Stack

- **Backend:** Express 5 + TypeScript
- **Frontend:** React 18 + Vite 6 + TypeScript
- **Auth:** QuickBooks OAuth 2.0 via express-session
- **QB SDK:** node-quickbooks + intuit-oauth

## Quick Start

### 1. Create a QuickBooks app

1. Go to [developer.intuit.com](https://developer.intuit.com/) and create an app
2. Set **Redirect URI** to `http://localhost:3001/api/auth/qb/callback`
3. Note your **Client ID** and **Client Secret**

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your QuickBooks credentials
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and click **Connect to QuickBooks**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev servers (Vite on :5173, Express on :3001) |
| `npm run build` | Build for production |
| `npm start` | Run production build |

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/qb/connect` | Redirect to QuickBooks OAuth |
| GET | `/api/auth/qb/callback` | OAuth callback |
| GET | `/api/auth/status` | Check connection status |
| POST | `/api/auth/logout` | Disconnect session |
| POST | `/api/invoices` | Create one invoice |
| POST | `/api/invoices/bulk` | Create multiple invoices |
| GET | `/api/invoices/:id` | Read an invoice |
| GET | `/api/invoices` | Search invoices |
| GET | `/api/customers` | List customers |
| GET | `/api/items` | List items |
| GET | `/api/company` | Get company info |

## Architecture

```
src/
  server/           # Express backend
    routes/         # API route handlers
    middleware/     # Auth guard, validation, error handling
    qb/            # QuickBooks client + handlers (from quickbooks-online-mcp-server)
    schemas/       # Zod input validation schemas
  client/          # React frontend (built by Vite)
    components/    # UI components (migrated from QB Tools SPA)
    hooks/         # useAuth, useWeeks
    api/           # Fetch wrappers for backend API
    utils/         # Date/money formatters
    styles/        # AdaptiveX design system CSS
```

## License

MIT
