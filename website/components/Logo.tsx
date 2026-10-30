import Link from "next/link";

// The ClearDocs mark: a document with a round violet stamp on its corner
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="ClearDocs home">
      <svg width="28" height="32" viewBox="0 0 28 32" aria-hidden="true">
        <path
          d="M3 1h15l7 7v21a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z"
          fill={light ? "#ffffff" : "#16233f"}
        />
        <path d="M18 1v7h7" fill="none" stroke={light ? "#16233f" : "#f5f6f9"} strokeWidth="1.5" />
        <rect x="5" y="11" width="11" height="2" rx="1" fill={light ? "#16233f" : "#f5f6f9"} opacity=".6" />
        <rect x="5" y="15.5" width="8" height="2" rx="1" fill={light ? "#16233f" : "#f5f6f9"} opacity=".6" />
        <circle cx="19" cy="23" r="6" fill="none" stroke="#7c61c4" strokeWidth="2" />
        <circle cx="19" cy="23" r="2.5" fill="#7c61c4" />
      </svg>
      <span className={`text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        ClearDocs
      </span>
    </Link>
  );
}
