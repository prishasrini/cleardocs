import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { services } from "@/lib/services";
import { CONTACT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Ask ClearDocs about attestation, apostille, translation or visa documents. We reply within one working day.",
  alternates: { canonical: "/contact" },
};

type Props = { searchParams: Promise<{ service?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  // /contact?service=apostille pre-selects that service in the form
  const { service } = await searchParams;
  const initialService = services.some((s) => s.slug === service) ? service : "";

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-10 sm:pt-16 lg:grid-cols-[1fr_1.5fr]">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Contact us</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Tell us the document and the country it&apos;s going to. We&apos;ll reply with the route, the price and what
          to send.
        </p>
        <dl className="mt-10 space-y-5">
          <div>
            <dt className="text-sm text-muted">Email</dt>
            <dd className="font-semibold">
              <a href={`mailto:${CONTACT.email}`} className="hover:text-stamp">
                {CONTACT.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Phone</dt>
            <dd className="font-semibold">{CONTACT.phone}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Hours</dt>
            <dd className="font-semibold">{CONTACT.hours}</dd>
          </div>
        </dl>
      </div>
      <ContactForm initialService={initialService} />
    </div>
  );
}
