import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { getPosts } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Guides",
  description: "Plain-language guides to attestation, apostille and getting your documents ready to use abroad.",
  alternates: { canonical: "/blog" },
};

// Check WordPress for new posts at most every 5 minutes
export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 sm:pt-16">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Guides</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        What each stamp means, what to prepare, and how to avoid the mistakes that send documents back.
      </p>

      {posts.length === 0 ? (
        <p className="mt-12 rounded-2xl bg-white p-8 text-muted ring-1 ring-line">
          No guides published yet. New posts from WordPress appear here within five minutes.
        </p>
      ) : (
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
