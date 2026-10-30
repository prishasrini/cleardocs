# WordPress → Next.js migration checklist

How the ClearDocs blog and pages moved from a WordPress site to Next.js, item by item. WordPress stays as the place where posts are written ("headless WordPress"); Next.js renders the site.

## 1. URLs

Every old URL either keeps working or redirects to its new home.

| Old WordPress URL | New URL | How |
|---|---|---|
| `/our-services` | `/services` | 301 redirect |
| `/our-services/apostille` | `/services/apostille` | 301 redirect |
| `/about-us` | `/about` | 301 redirect |
| `/contact-us` | `/contact` | 301 redirect |
| `/2026/10/attestation-vs-apostille` | `/blog/attestation-vs-apostille` | 301 redirect (date permalinks) |
| `/category/guides`, `/tag/uae` | `/blog` | 301 redirect |
| Anything else | Custom 404 page | `app/not-found.tsx` points people to services and guides |

The post **slug** is kept exactly as it is in WordPress, so `/blog/<slug>` always matches the WordPress post.

## 2. Redirects

All redirects are in `next.config.ts` under `redirects()`. They use `permanent: true`, which sends a **301**. A 301 tells Google the page has moved for good, so the old page's ranking passes to the new URL.

Test one locally:
```bash
curl -I http://localhost:3000/about-us
# HTTP/1.1 308 Permanent Redirect   (Next.js uses 308, the modern equivalent of 301)
# location: /about
```

## 3. Metadata

- Every page exports `metadata` (or `generateMetadata` for posts and services) with a title and description.
- Titles follow one template: `Page name | ClearDocs` (set in `app/layout.tsx`).
- Blog posts use the WordPress title and excerpt, and Open Graph tags (title, description, image, published date) for link previews.
- Every page has a canonical URL so search engines don't index duplicates.

## 4. Images

- Featured images come from the WordPress media library through `_embed=wp:featuredmedia`.
- They are shown with `next/image`, which resizes them, serves modern formats and lazy-loads them.
- Images inside post content keep their WordPress URLs and get `height: auto` so they scale on phones.

## 5. Forms

- The WordPress contact form is replaced by `components/ContactForm.tsx`.
- It posts to the Express API (`POST /api/enquiries`), which saves the enquiry in MongoDB.
- The form validates in the browser and the API validates again on the server.

## 6. SEO

- `/sitemap.xml` is generated from the services and every WordPress post (`app/sitemap.ts`).
- `/robots.txt` allows crawling and points to the sitemap (`app/robots.ts`).
- Service pages include JSON-LD structured data (`@type: Service` with price).
- Pages are prerendered as static HTML, and blog pages refresh every 5 minutes with ISR, so they're fast and fully readable by crawlers.

## Before switching the domain over

- [ ] Every URL in the WordPress sitemap returns 200 or a redirect on the new site
- [ ] Contact form submissions arrive
- [ ] Titles and descriptions match or improve on the old ones
- [ ] New sitemap submitted in Google Search Console
- [ ] Old WordPress front end set to "Discourage search engines" or put behind a login, so only the API is used
