import type { Metadata } from "next";
import Link from "next/link";
import PriceEstimator from "@/components/PriceEstimator";
import { services, formatPrice } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services",
  description: "Document attestation, apostille, certified translation and visa documentation, with prices and timelines.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 sm:pt-16">
      <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">Services</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        Starting prices include government and embassy fees. Courier both ways is extra and depends on your city.
      </p>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {services.map((s) => (
          <Link
            key={s.slug}
            href={`/services/${s.slug}`}
            className="group flex flex-col rounded-2xl bg-white p-7 ring-1 ring-line transition-shadow hover:ring-stamp/50"
          >
            <h2 className="text-2xl font-bold transition-colors group-hover:text-stamp">{s.title}</h2>
            <p className="mt-2 flex-1 leading-relaxed text-muted">{s.summary}</p>
            <dl className="mt-6 flex gap-8 border-t border-line pt-5 text-sm">
              <div>
                <dt className="text-muted">From</dt>
                <dd className="text-lg font-bold">{formatPrice(s.startingPrice)}</dd>
              </div>
              <div>
                <dt className="text-muted">Takes</dt>
                <dd className="text-lg font-bold">{s.turnaround}</dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>

      <section className="mt-20">
        <h2 className="text-3xl font-extrabold tracking-tight">Estimate your cost</h2>
        <div className="mt-8">
          <PriceEstimator />
        </div>
      </section>
    </div>
  );
}
