import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPost, getPosts, formatDate } from "@/lib/wordpress";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

// Pre-build a page for every post that exists at build time.
// Posts published later are built on their first visit, then cached.
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 pt-10 sm:pt-16">
      <Link href="/blog" className="text-sm font-semibold text-stamp hover:underline">
        All guides
      </Link>
      <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
      <time dateTime={post.date} className="mt-4 block text-muted">
        {formatDate(post.date)}
      </time>

      {post.image && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={post.image} alt="" fill className="object-cover" priority sizes="(min-width: 768px) 768px, 100vw" />
        </div>
      )}

      {/* The post body is HTML written in WordPress (cleaned in lib/wordpress.ts) */}
      <div className="prose-wp mt-10" dangerouslySetInnerHTML={{ __html: post.content }} />

      <div className="mt-16 rounded-2xl bg-white p-7 ring-1 ring-line">
        <p className="text-lg font-bold">Need help with your documents?</p>
        <p className="mt-1 text-muted">Tell us the document and the country. We&apos;ll reply within one working day.</p>
        <Link href="/contact" className="btn btn-primary mt-5">
          Contact us
        </Link>
      </div>
    </article>
  );
}
