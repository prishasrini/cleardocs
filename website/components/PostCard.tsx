import Link from "next/link";
import Image from "next/image";
import { type Post, formatDate } from "@/lib/wordpress";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="group relative flex flex-col rounded-2xl bg-white p-6 ring-1 ring-line transition-shadow hover:ring-stamp/40">
      {post.image && (
        <div className="relative -mx-6 -mt-6 mb-5 aspect-[16/9] overflow-hidden rounded-t-2xl">
          <Image src={post.image} alt="" fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
        </div>
      )}
      <time dateTime={post.date} className="text-sm text-muted">
        {formatDate(post.date)}
      </time>
      <h3 className="mt-2 text-lg font-bold leading-snug">
        {/* The ::after makes the whole card clickable while keeping one link for screen readers */}
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-stamp">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 leading-relaxed text-muted">{post.excerpt}</p>
    </article>
  );
}
