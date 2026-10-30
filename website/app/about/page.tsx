import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Why ClearDocs exists and how we handle your documents and personal data.",
  alternates: { canonical: "/about" },
};

const promises = [
  {
    title: "One price, said up front",
    text: "The quote includes government and embassy fees. If an office changes its fee, we tell you before we pay it.",
  },
  {
    title: "Your documents stay private",
    text: "Scans are stored privately and only you and our team can open them. We delete them 90 days after a request is completed.",
  },
  {
    title: "You always know the status",
    text: "Every time your document moves to a new office, the app updates. You never have to call to find out.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 sm:pt-16">
      <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
        Paperwork shouldn&apos;t be the hardest part of moving abroad.
      </h1>
      <div className="mt-8 max-w-[38rem] space-y-5 text-lg leading-relaxed text-muted">
        <p>
          Getting a degree certificate attested can mean four offices, three couriers and weeks of not knowing where
          your original is. Most people do it once, so they never learn the route, and one missing photocopy can send
          everything back to the start.
        </p>
        <p>
          ClearDocs does this every day. We know which office comes next, what each one asks for, and how long each
          step really takes. You upload your scans once and follow the rest from your phone.
        </p>
      </div>

      <section className="mt-16 grid gap-5 md:grid-cols-3">
        {promises.map((p) => (
          <div key={p.title} className="rounded-2xl bg-white p-7 ring-1 ring-line">
            <h2 className="text-lg font-bold">{p.title}</h2>
            <p className="mt-2 leading-relaxed text-muted">{p.text}</p>
          </div>
        ))}
      </section>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-ink px-8 py-10 text-white">
        <p className="max-w-lg text-2xl font-bold">Not sure which route your document needs?</p>
        <Link href="/contact" className="btn bg-white text-ink hover:bg-stamp-soft">
          Ask us
        </Link>
      </div>
    </div>
  );
}
