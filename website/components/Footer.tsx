import Link from "next/link";
import Logo from "./Logo";
import { services } from "@/lib/services";
import { CONTACT } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-white/75">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo light />
          <p className="mt-4 leading-relaxed">
            Attestation, apostille, translation and visa paperwork, handled from Chennai and tracked in one app.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-white">Services</h2>
          <ul className="mt-4 space-y-2.5">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="hover:text-white">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-white">Contact</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="hover:text-white">
                {CONTACT.email}
              </a>
            </li>
            <li>{CONTACT.phone}</li>
            <li>{CONTACT.hours}</li>
            <li>{CONTACT.city}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-6 text-sm text-white/50">
          © {new Date().getFullYear()} ClearDocs. A portfolio project built with Next.js and WordPress.
        </p>
      </div>
    </footer>
  );
}
