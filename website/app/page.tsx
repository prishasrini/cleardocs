import Link from "next/link";
import RouteFinder from "@/components/RouteFinder";
import PriceEstimator from "@/components/PriceEstimator";
import TrackerDemo from "@/components/TrackerDemo";
import PostCard from "@/components/PostCard";
import { services, formatPrice } from "@/lib/services";
import { getPosts } from "@/lib/wordpress";

// Rebuild this page in the background at most every 5 minutes,
// so new WordPress posts show up without redeploying.
export const revalidate = 300;

const steps = [
  { title: "Upload scans", text: "Pick a service in the app and add clear photos or PDFs of your documents." },
  { title: "We check everything", text: "Our team reviews the scans within a day and tells you which originals to courier." },
  { title: "Stamps, one by one", text: "We take your documents through each office on the route and update you at every step." },
  { title: "Back to you", text: "Your attested documents are couriered back, ready to use abroad." },
];

export default async function HomePage() {
  const posts = (await getPosts(3)).slice(0, 3);

  return (
    <>
      {/* Hero: the headline on the left, the interactive route finder on the right */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1fr_1.05fr] lg:pt-16">
        <div>
          <h1 className="text-[2.6rem] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
            Every stamp your documents need, tracked from your phone.
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted">
            ClearDocs gets Indian certificates attested, apostilled and translated for jobs, study and visas abroad.
            Pick a country to see the route your document takes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-primary">
              Get a quote
            </Link>
            <Link href="/services" className="btn btn-secondary">
              See services
            </Link>
          </div>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <dt className="text-sm text-muted">Countries covered</dt>
              <dd className="text-2xl font-extrabold">40+</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Scans reviewed within</dt>
              <dd className="text-2xl font-extrabold">1 working day</dd>
            </div>
          </dl>
        </div>
        <RouteFinder />
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">What we take care of</h2>
          <Link href="/services" className="font-semibold text-stamp hover:underline">
            All services
          </Link>
        </div>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {services.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="group grid gap-1 py-6 transition-colors sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8"
              >
                <div>
                  <h3 className="text-xl font-bold transition-colors group-hover:text-stamp">{s.title}</h3>
                  <p className="mt-1 text-muted">{s.summary}</p>
                </div>
                <div className="flex gap-6 text-sm sm:text-right">
                  <span>
                    <span className="block text-muted">From</span>
                    <span className="font-bold">{formatPrice(s.startingPrice)}</span>
                  </span>
                  <span>
                    <span className="block text-muted">Takes</span>
                    <span className="font-bold">{s.turnaround}</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works: a real sequence, so numbering makes sense here */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">How a request moves</h2>
          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-double border-stamp text-lg font-extrabold text-stamp">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Interactive app tracker */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Follow your request in the app</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            No more calling to ask where your certificate is. The ClearDocs app shows each stage as it happens.
          </p>
        </div>
        <TrackerDemo />
      </section>

      {/* Price estimator */}
      <section className="mx-auto max-w-6xl px-5 py-16" id="estimate">
        <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">Estimate your cost</h2>
        <p className="mb-8 mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Prices include government and embassy fees. You get an exact quote after we see your documents.
        </p>
        <PriceEstimator />
      </section>

      {/* Latest guides from WordPress */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Guides</h2>
          <Link href="/blog" className="font-semibold text-stamp hover:underline">
            All guides
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}
