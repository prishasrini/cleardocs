# ClearDocs API

The REST API behind the ClearDocs website and app. Node.js + Express 5 + MongoDB.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | What it is |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string, with `cleardocs` as the database name |
| `JWT_SECRET` | A long random string. Make one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CLIENT_ORIGINS` | Websites allowed to call the API, comma separated |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The admin account `npm run seed` creates |

Then:

```bash
npm run seed   # adds the 4 services and the admin account (safe to run again)
npm run dev    # starts on http://localhost:5000 and restarts when you save
npm test       # runs the API tests (see below for which database they use)
```

Check it's running: open http://localhost:5000/api/health.

### Running the tests

The tests need their own database, which they empty before and after running. Your real `cleardocs` database is never touched.

- **Using the MongoDB on your computer (fastest):**
  ```powershell
  $env:TEST_MONGO_URI="mongodb://127.0.0.1:27017/cleardocs_test"
  npm test
  ```
- **Without a local MongoDB:** just run `npm test`. It downloads a temporary MongoDB the first time (a few hundred MB).

## Endpoints

Routes marked 🔒 need `Authorization: Bearer <token>`. Routes marked 👑 are admin only.

| Method | Path | What it does |
|---|---|---|
| GET | `/api/health` | Is the API up? |
| POST | `/api/auth/register` | Create an account `{ name, email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | Log in `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` 🔒 | The logged-in user |
| GET | `/api/services` | All services |
| GET | `/api/services/:slug` | One service |
| POST | `/api/requests` 🔒 | New request. `multipart/form-data` with `serviceId`, `notes`, and 1–5 `files` (PDF/JPG/PNG/WEBP, 5 MB each) |
| GET | `/api/requests/mine` 🔒 | My requests |
| GET | `/api/requests/:id` 🔒 | One request (owner or admin) |
| GET | `/api/requests/:id/files/:storedName` 🔒 | Download a file (owner or admin) |
| GET | `/api/requests/:id/files/:storedName/link` 🔒 | A signed link that opens the file for 5 minutes |
| GET | `/api/requests` 🔒👑 | All requests, optional `?status=in_review` |
| PATCH | `/api/requests/:id/status` 🔒👑 | Change status `{ status, note }`. Every change is kept in `history` |
| POST | `/api/enquiries` | Website contact form |
| GET | `/api/enquiries` 🔒👑 | All enquiries |

Statuses: `submitted`, `in_review`, `processing`, `completed`, `rejected`.

## How it's organised

```
backend/
├── server.js          starts the server after connecting to MongoDB
├── app.js             Express app: middleware, routes, error handler
├── seed.js            fills the database
├── config/db.js       MongoDB connection
├── models/            Mongoose schemas: User, Service, Request, Enquiry
├── middleware/
│   ├── auth.js        protect (checks the JWT) and adminOnly
│   └── upload.js      Multer: file types, size limits, random file names
├── routes/            one file per resource
├── data/services.js   the services list used by the seed script
└── test/api.test.js   end-to-end API tests
```

## Security decisions

- Passwords are hashed with bcrypt and never returned by the API.
- Nobody can make themselves admin: `role` is ignored on sign-up.
- Login gives the same error for a wrong email and a wrong password, so it can't be used to check which emails have accounts.
- Uploaded files get random names, are not served publicly, and can only be opened by their owner or an admin. Other people's requests return 404, so their existence isn't revealed.
- Only PDF and image uploads are accepted, 5 MB each, 5 per request.
- Secrets live in `.env`, which is in `.gitignore`.
