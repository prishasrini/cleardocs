import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PriceEstimator from "@/components/PriceEstimator";
import { services, getService, formatPrice } from "@/lib/services";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// Build one page per service at build time: /services/apostille, /services/translation-services, ...
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

// Each service page gets its own title and description for Google
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  // Structured data helps Google understand this is a service with a price
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: { "@type": "Organization", name: "ClearDocs", url: SITE_URL },
    areaServed: "IN",
    offers: { "@type": "Offer", price: service.startingPrice, priceCurrency: "INR" },
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 sm:pt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/services" className="hover:text-stamp">
          Services
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{service.title}</span>
      </nav>

      <div className="mt-6 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{service.title}</h1>
          <p className="mt-5 max-w-[38rem] text-lg leading-relaxed text-muted">{service.description}</p>
        </div>

        <aside className="h-fit rounded-2xl bg-white p-7 ring-1 ring-line">
          <dl className="grid grid-cols-2 gap-6">
            <div>
              <dt className="text-sm text-muted">From</dt>
              <dd className="text-2xl font-extrabold">{formatPrice(service.startingPrice)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Takes</dt>
              <dd className="text-lg font-bold">{service.turnaround}</dd>
            </div>
          </dl>
          <h2 className="mt-7 font-semibold">What you&apos;ll need</h2>
          <ul className="mt-3 space-y-2">
            {service.requiredDocuments.map((doc) => (
              <li key={doc} className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-stamp" />
                {doc}
              </li>
            ))}
          </ul>
          <Link href={`/contact?service=${service.slug}`} className="btn btn-primary mt-7 w-full">
            Ask about {service.title.toLowerCase()}
          </Link>
        </aside>
      </div>

      <section className="mt-20">
        <h2 className="text-3xl font-extrabold tracking-tight">Estimate your cost</h2>
        <div className="mt-8">
          {/* key makes the estimator reset when you move between service pages */}
          <PriceEstimator key={service.slug} initialSlug={service.slug} />
        </div>
      </section>
    </div>
  );
}
