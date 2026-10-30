import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
      <span className="flex h-24 w-24 -rotate-6 items-center justify-center rounded-full border-4 border-double border-stamp text-xl font-extrabold text-stamp">
        404
      </span>
      <h1 className="mt-8 text-3xl font-extrabold">This page doesn&apos;t exist</h1>
      <p className="mt-3 text-muted">
        It may have moved when we switched from our old website. Try the services list or the guides.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/services" className="btn btn-primary">
          See services
        </Link>
        <Link href="/blog" className="btn btn-secondary">
          Read guides
        </Link>
      </div>
    </div>
  );
}
