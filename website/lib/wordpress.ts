// Reads blog posts from WordPress through the WordPress REST API.
//
// Set WORDPRESS_API_URL in .env.local to your site's REST base, for example:
//   Self-hosted / InstaWP / LocalWP:  https://yoursite.com/wp-json/wp/v2
//   WordPress.com free site:          https://public-api.wordpress.com/wp/v2/sites/yoursite.wordpress.com
//
// If it isn't set (or WordPress is down), the blog falls back to the sample posts
// at the bottom of this file, so the site never shows a broken page.

export type Post = {
  slug: string;
  title: string;
  excerpt: string; // plain text
  content: string; // HTML from WordPress
  date: string; // ISO date
  image?: string;
  source: "wordpress" | "sample";
};

// The shape of a post as WordPress sends it (only the fields we use)
type WPPost = {
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  _embedded?: { "wp:featuredmedia"?: { source_url?: string }[] };
};

const WP_API = process.env.WORDPRESS_API_URL?.replace(/\/$/, "");

// Re-check WordPress for new posts every 5 minutes (Incremental Static Regeneration)
const REVALIDATE_SECONDS = 300;

// WordPress titles and excerpts contain HTML entities like &#8217; and tags like <p>
function decodeEntities(text: string) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…");
}

function stripTags(html: string) {
  return decodeEntities(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

// WordPress content is written by our own editors, but we still remove
// script tags and inline event handlers before putting it on the page.
function cleanHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

function toPost(p: WPPost): Post {
  return {
    slug: p.slug,
    title: stripTags(p.title.rendered),
    excerpt: stripTags(p.excerpt.rendered).replace(/\s*\[…\]$|\s*…$/, "…"),
    content: cleanHtml(p.content.rendered),
    date: p.date,
    image: p._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
    source: "wordpress",
  };
}

async function fetchFromWordPress(path: string): Promise<WPPost[] | null> {
  if (!WP_API) return null;
  try {
    const res = await fetch(`${WP_API}${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) throw new Error(`WordPress responded ${res.status}`);
    return (await res.json()) as WPPost[];
  } catch (err) {
    console.error("Could not load posts from WordPress:", (err as Error).message);
    return null;
  }
}

export async function getPosts(limit = 20): Promise<Post[]> {
  const data = await fetchFromWordPress(`/posts?per_page=${limit}&_embed=wp:featuredmedia`);
  if (data) return data.map(toPost);
  return samplePosts.slice(0, limit);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const data = await fetchFromWordPress(`/posts?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia`);
  if (data) return data[0] ? toPost(data[0]) : undefined;
  return samplePosts.find((p) => p.slug === slug);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Sample posts, used only when WordPress isn't connected.
// Create these same three posts in WordPress (see WORDPRESS_SETUP.md).
// ---------------------------------------------------------------------------
export const samplePosts: Post[] = [
  {
    slug: "attestation-vs-apostille",
    title: "Attestation or apostille: which one do you need?",
    excerpt:
      "Both make an Indian document valid abroad, but they follow different routes. The country you are going to decides which one you need.",
    date: "2026-10-12T10:00:00",
    source: "sample",
    content: `
<p>Both attestation and apostille make an Indian document valid in another country. Which one you need depends only on where the document is going.</p>
<h2>Apostille</h2>
<p>If the destination country signed the 1961 Hague Apostille Convention, you need an apostille. The Ministry of External Affairs (MEA) adds one sticker to the document and it is accepted in every member country. Most of Europe, the USA, Australia and Japan are members.</p>
<h2>Attestation</h2>
<p>If the country is not a member, the document goes through a chain of stamps instead: a notary, the state Home or HRD department, the MEA, and finally that country's embassy. The UAE, Qatar and Kuwait follow this route.</p>
<h2>A quick way to check</h2>
<ul>
  <li>Search for your destination on the Hague Conference's list of contracting parties.</li>
  <li>If it is listed, ask for an apostille.</li>
  <li>If not, ask for embassy attestation.</li>
</ul>
<p>Not sure? Send us the destination and the document type and we will confirm the route before you pay anything.</p>`,
  },
  {
    slug: "degree-certificate-attestation-checklist",
    title: "Degree certificate attestation: a checklist before you start",
    excerpt:
      "Most delays come from one missing document. Check these six things before you send your degree for attestation.",
    date: "2026-09-28T10:00:00",
    source: "sample",
    content: `
<p>Most attestation delays come from a single missing document. Before you send your degree certificate, check these six things.</p>
<ol>
  <li><strong>Original degree certificate</strong>, not the provisional certificate.</li>
  <li><strong>Mark sheets or transcripts</strong> for every year. Some embassies ask for them.</li>
  <li><strong>Passport copy</strong> with the same name spelling as the certificate.</li>
  <li><strong>Visa copy</strong>, if you already have one.</li>
  <li><strong>Authorisation letter</strong> if someone else submits on your behalf.</li>
  <li><strong>Name change proof</strong> if your name differs between documents.</li>
</ol>
<p>If your passport and certificate spell your name differently, sort that out first. It is the most common reason documents get sent back.</p>`,
  },
  {
    slug: "how-to-scan-documents-on-your-phone",
    title: "How to scan documents on your phone so they get accepted",
    excerpt:
      "Blurry or cropped scans are the first thing to slow a request down. Here is how to get a clean scan with just your phone.",
    date: "2026-09-10T10:00:00",
    source: "sample",
    content: `
<p>You don't need a scanner. A phone camera is enough if you follow a few rules.</p>
<h2>Light and background</h2>
<p>Put the document on a dark, plain surface near a window. Avoid the flash, which leaves a bright patch over stamps and signatures.</p>
<h2>Use a scanning mode</h2>
<p>Google Drive, the iPhone Notes app and most camera apps have a document scan mode. It straightens the page and crops the edges for you.</p>
<h2>Check before you upload</h2>
<ul>
  <li>All four corners are visible.</li>
  <li>Stamps and signatures are readable when you zoom in.</li>
  <li>The file is a PDF or JPG under 5 MB.</li>
</ul>
<p>In the ClearDocs app you can attach up to five files to one request.</p>`,
  },
];
