# ClearDocs website

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
npm run build      # production build (also type-checks)
npm run lint
```

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_API_URL` | The Express backend, used by the contact form |
| `NEXT_PUBLIC_SITE_URL` | This site's own address, used in the sitemap and SEO tags |
| `WORDPRESS_API_URL` | Your WordPress REST API. Empty = sample posts. See [`../WORDPRESS_SETUP.md`](../WORDPRESS_SETUP.md) |

## Pages

| URL | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Hero with the route finder, services, how it works, app tracker demo, price estimator, latest guides |
| `/services` | `app/services/page.tsx` | All services and the estimator |
| `/services/[slug]` | `app/services/[slug]/page.tsx` | Built at build time with `generateStaticParams`, has its own metadata and JSON-LD |
| `/blog`, `/blog/[slug]` | `app/blog/...` | Posts from WordPress, refreshed every 5 minutes (ISR) |
| `/about`, `/contact` | `app/about`, `app/contact` | `/contact?service=apostille` pre-selects a service |
| `/sitemap.xml`, `/robots.txt` | `app/sitemap.ts`, `app/robots.ts` | Generated, includes every blog post |

## Interactive components

All in `components/`. They're client components (`"use client"`) because they use state.

- **`RouteFinder`**: choose a country and a certificate gets stamped live, one stamp at a time, showing that country's attestation or apostille route. The stamps animate with CSS; changing `key` restarts the animation.
- **`PriceEstimator`**: service, number of documents and express toggle. The price is calculated during render, so it always matches the controls.
- **`TrackerDemo`**: a phone mockup of the app's timeline that you can step through.
- **`ContactForm`**: validation that shows errors after you leave a field, a sending state, server errors, and an animated success tick.
- **`Header`**: changes when you scroll, and has an animated mobile menu that closes when you change page.

Motion respects the "reduce motion" system setting.

## WordPress

`lib/wordpress.ts` fetches posts from the WordPress REST API, converts them to a simple `Post` type, removes `<script>` tags, and falls back to built-in sample posts if WordPress isn't configured or is down. The migration redirects and checklist are in [`MIGRATION.md`](MIGRATION.md).

## Design

- **Colours:** navy ink (`#16233f`) for text and buttons, violet stamp ink (`#5b3fa0`, the colour of Indian government rubber stamps) as the accent, a cool off-white page (`#f5f6f9`). Defined as Tailwind theme tokens in `app/globals.css`.
- **Font:** Public Sans, a typeface designed for government websites.
