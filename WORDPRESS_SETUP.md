# Connecting a WordPress site

The website's blog reads posts from WordPress through the WordPress REST API. Until you connect one, it shows three built-in sample posts.

## 1. Create a free WordPress site

Pick one:

- **WordPress.com (easiest, free, stays online):** sign up at wordpress.com and create a free site, e.g. `cleardocsblog.wordpress.com`.
- **InstaWP (a real self-hosted WordPress, free for testing):** go to instawp.com and launch a site. Good for showing "real" WordPress admin experience, but free sites expire after a while.
- **LocalWP (on your laptop):** install LocalWP and create a site. Only works while your laptop is running it.

## 2. Add posts

In the WordPress dashboard go to **Posts → Add New**. Copy the three sample guides from `website/lib/wordpress.ts` (the `samplePosts` list), or write your own. For each post:

- Set the **slug** (in the post settings, under "URL" or "Permalink"), e.g. `attestation-vs-apostille`
- Optionally set a **featured image**
- Click **Publish**

## 3. Find your REST API address and check it works

Open it in your browser. You should see your posts as JSON.

| Site type | REST API address |
|---|---|
| WordPress.com | `https://public-api.wordpress.com/wp/v2/sites/YOURSITE.wordpress.com` |
| InstaWP / self-hosted / LocalWP | `https://YOURSITE.com/wp-json/wp/v2` |

Add `/posts` to the end to see the posts, e.g.
`https://public-api.wordpress.com/wp/v2/sites/cleardocsblog.wordpress.com/posts`

## 4. Connect it

In `website/.env.local`:
```
WORDPRESS_API_URL=https://public-api.wordpress.com/wp/v2/sites/cleardocsblog.wordpress.com
```

Restart `npm run dev`. The Guides page now shows your WordPress posts. Publish a new post, and it appears on the site within 5 minutes without redeploying.

## What to say about it in an interview

- WordPress is used **headless**: editors keep using the WordPress dashboard, and Next.js renders the pages.
- Posts are fetched on the server, cached, and refreshed every 5 minutes with **Incremental Static Regeneration**.
- The WordPress response is mapped to a small `Post` type, HTML entities are decoded, and `<script>` tags are removed before rendering.
- If WordPress is down, the site falls back to sample content instead of breaking.
- Old WordPress URLs redirect to the new ones with 301s (see `website/MIGRATION.md`).
