"use client";

import { useState } from "react";
import Link from "next/link";
import { services, formatPrice } from "@/lib/services";

// Pricing rules (an estimate; the final quote comes after we see the documents)
const EXTRA_DOCUMENT_RATE = 0.7; // each extra document costs 70% of the first
const EXPRESS_RATE = 0.4; // express adds 40%

export default function PriceEstimator({ initialSlug }: { initialSlug?: string }) {
  const [slug, setSlug] = useState(initialSlug ?? services[0].slug);
  const [count, setCount] = useState(1);
  const [express, setExpress] = useState(false);

  // These are recalculated on every render, so they always match the controls
  const service = services.find((s) => s.slug === slug)!;
  const base = service.startingPrice * (1 + (count - 1) * EXTRA_DOCUMENT_RATE);
  const total = Math.round((express ? base * (1 + EXPRESS_RATE) : base) / 50) * 50;
  const days = express ? `About half of ${service.turnaround}` : service.turnaround;

  return (
    <div className="grid gap-8 rounded-3xl bg-white p-6 ring-1 ring-line sm:p-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-7">
        <fieldset>
          <legend className="font-semibold">Service</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <label
                key={s.slug}
                className={`cursor-pointer rounded-xl border-[1.5px] px-4 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-stamp ${
                  s.slug === slug ? "border-stamp bg-stamp-soft" : "border-line hover:border-stamp/50"
                }`}
              >
                <input
                  type="radio"
                  name="service"
                  value={s.slug}
                  checked={s.slug === slug}
                  onChange={() => setSlug(s.slug)}
                  className="sr-only"
                />
                <span className="block font-semibold">{s.title}</span>
                <span className="text-sm text-muted">from {formatPrice(s.startingPrice)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="doc-count" className="flex items-baseline justify-between font-semibold">
            Number of documents
            <span className="text-2xl font-extrabold tabular-nums text-stamp">{count}</span>
          </label>
          <input
            id="doc-count"
            type="range"
            min={1}
            max={10}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--color-stamp)]"
          />
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span>
            <span className="block font-semibold">Express handling</span>
            <span className="text-sm text-muted">Priority processing and courier</span>
          </span>
          {/* A toggle switch built from a checkbox */}
          <span className="relative">
            <input
              type="checkbox"
              checked={express}
              onChange={(e) => setExpress(e.target.checked)}
              className="peer sr-only"
            />
            <span className="block h-7 w-12 rounded-full bg-line transition-colors peer-checked:bg-stamp peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-stamp" />
            <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </span>
        </label>
      </div>

      <div className="flex flex-col justify-between rounded-2xl bg-ink p-6 text-white">
        <div aria-live="polite">
          <p className="text-white/60">Estimated cost</p>
          {/* key={total} replays the little pop animation whenever the price changes */}
          <p key={total} className="mt-1 animate-[pop_250ms_ease-out] text-5xl font-extrabold tracking-tight tabular-nums">
            {formatPrice(total)}
          </p>
          <p className="mt-4 text-white/60">Timeline</p>
          <p className="mt-1 font-semibold">{days}</p>
          <p className="mt-4 text-sm text-white/60">
            {count} {count === 1 ? "document" : "documents"}, {service.title.toLowerCase()}
            {express ? ", express" : ""}. Government and embassy fees are included.
          </p>
        </div>
        <Link
          href={`/contact?service=${service.slug}`}
          className="btn mt-8 bg-white text-ink hover:bg-stamp-soft"
        >
          Get an exact quote
        </Link>
      </div>
    </div>
  );
}
