# ClearDocs

A document services platform: people upload scans of certificates, ClearDocs gets them attested, apostilled or translated for use abroad, and customers follow every stage in a mobile app.

It is three apps that share one backend:

| Folder | What it is | Built with |
|---|---|---|
| [`backend/`](backend) | REST API: accounts, services, document requests with file uploads, status tracking, contact enquiries | Node.js, Express, MongoDB (Mongoose), JWT, Multer |
| [`website/`](website) | Marketing website with an interactive route finder, price estimator and a blog pulled from WordPress | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS |
| [`mobile/`](mobile) | Customer and admin app: sign up, submit a request with files, track its status, update statuses as admin | React Native, Expo SDK 58, Expo Router, TypeScript |

```
             ┌──────────────┐        ┌───────────────┐
             │   WordPress  │        │  MongoDB Atlas │
             │  (blog posts)│        └───────▲───────┘
             └──────┬───────┘                │
        WP REST API │                        │ Mongoose
             ┌──────▼───────┐  enquiries ┌───┴──────────┐  login, requests,  ┌──────────────┐
             │   Website    ├───────────►│  Express API │◄───────────────────┤  Expo app    │
             │  (Next.js)   │            │  (backend/)  │   uploads, status  │  (mobile/)   │
             └──────────────┘            └──────────────┘                    └──────────────┘
```

## What each part shows

- **Web:** Next.js App Router, server and client components, TypeScript, Tailwind, responsive layouts, reusable components, SEO metadata, sitemap, robots.txt, structured data, Incremental Static Regeneration
- **Mobile:** Expo Router with protected routes, tabs and stacks, forms with validation, file uploads, secure token storage, animations with Reanimated, pull-to-refresh
- **WordPress:** blog content read through the WordPress REST API, plus a migration setup with 301 redirects for old WordPress URLs ([`website/MIGRATION.md`](website/MIGRATION.md))
- **Integrations:** REST API design, JWT login, multipart uploads, role-based access (user/admin), private file links, credentials kept in `.env` files

## Run it on your computer

You need **Node.js 20+**, a free **MongoDB Atlas** database, and the **Expo Go** app on your phone.

**1. Backend** (terminal 1)
```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm run seed              # adds the services and your admin account
npm run dev               # http://localhost:5000
```

**2. Website** (terminal 2)
```bash
cd website
npm install
cp .env.example .env.local
npm run dev               # http://localhost:3000
```

**3. Mobile app** (terminal 3)
```bash
cd mobile
npm install
npx expo start            # scan the QR code with Expo Go
```
Your phone and laptop must be on the same Wi-Fi. The app finds the backend automatically.

Each folder's README has the details. To connect a real WordPress site, follow [`WORDPRESS_SETUP.md`](WORDPRESS_SETUP.md). To put everything online, see [`DEPLOY.md`](DEPLOY.md).

## Logging in as admin

`npm run seed` creates the admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`. Log in with it in the app to see the **Admin** tab, where you can filter all requests and move them through *Submitted → In review → Processing → Completed*.
