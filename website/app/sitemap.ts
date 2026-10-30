import type { MetadataRoute } from "next";
import { services } from "@/lib/services";
import { getPosts } from "@/lib/wordpress";
import { SITE_URL } from "@/lib/site";

// Generates /sitemap.xml so Google can find every page, including each blog post
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts(100);

  const pages = ["", "/services", "/blog", "/about", "/contact"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const servicePages = services.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const postPages = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...pages, ...servicePages, ...postPages];
}
