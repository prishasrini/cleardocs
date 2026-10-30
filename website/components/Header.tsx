"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const links = [
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  // The menu remembers which page it was opened on, so it closes by itself
  // when you navigate to another page.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === pathname;
  const [scrolled, setScrolled] = useState(false);

  // Add a shadow and solid background once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,box-shadow] duration-300 ${
        scrolled || menuOpen ? "bg-white/90 shadow-[0_1px_0_var(--color-line)] backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-[0.95rem] font-medium transition-colors ${
                isActive(l.href) ? "bg-stamp-soft text-stamp" : "text-ink-soft hover:text-stamp"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className="btn btn-primary ml-3 !py-2.5">
            Get a quote
          </Link>
        </nav>

        <button
          type="button"
          className="relative h-10 w-10 rounded-full md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpenOn(menuOpen ? null : pathname)}
        >
          {/* Two bars that turn into an X */}
          <span
            className={`absolute left-2.5 h-0.5 w-5 bg-ink transition-transform duration-300 ${
              menuOpen ? "top-[19px] rotate-45" : "top-[15px]"
            }`}
          />
          <span
            className={`absolute left-2.5 h-0.5 w-5 bg-ink transition-transform duration-300 ${
              menuOpen ? "top-[19px] -rotate-45" : "top-[23px]"
            }`}
          />
        </button>
      </div>

      {/* Mobile menu: slides open by animating its height */}
      <div
        id="mobile-menu"
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 md:hidden ${
          menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <nav aria-label="Mobile" className="min-h-0">
          <ul className="flex flex-col gap-1 px-5 pb-5">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  tabIndex={menuOpen ? 0 : -1}
                  className={`block rounded-xl px-4 py-3 text-lg font-semibold ${
                    isActive(l.href) ? "bg-stamp-soft text-stamp" : "text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
