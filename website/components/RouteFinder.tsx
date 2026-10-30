"use client";

import { useState } from "react";
import { destinations } from "@/lib/routes";

// Small tilts so the stamps look hand-pressed, not machine-aligned
const TILTS = [-9, 6, -4, 8, -6];

// Where each stamp sits on the certificate (percent from top-left)
const POSITIONS = [
  { left: "4%", top: "47%" },
  { left: "23.5%", top: "66%" },
  { left: "42%", top: "45%" },
  { left: "60.5%", top: "66%" },
  { left: "78%", top: "47%" },
];

export default function RouteFinder() {
  const [selected, setSelected] = useState(destinations[0].code);
  const destination = destinations.find((d) => d.code === selected)!;

  return (
    <div className="relative">
      {/* Country picker */}
      <div role="radiogroup" aria-label="Destination country" className="flex flex-wrap gap-2">
        {destinations.map((d) => {
          const active = d.code === selected;
          return (
            <button
              key={d.code}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(d.code)}
              className={`rounded-full border-[1.5px] px-4 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "border-stamp bg-stamp text-white"
                  : "border-line bg-white text-ink-soft hover:border-stamp hover:text-stamp"
              }`}
            >
              {d.country}
            </button>
          );
        })}
      </div>

      {/* The certificate. key={selected} makes React rebuild it when the country changes,
          which restarts the stamp animation from the beginning. */}
      <div
        key={selected}
        className="relative mt-5 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_60px_-30px_rgba(22,35,63,0.35)]"
      >
        {/* Certificate text, drawn as lines */}
        <div className="absolute inset-x-[8%] top-[9%]">
          <p className="text-center text-[0.7rem] font-semibold tracking-wide text-muted">University of Madras</p>
          <p className="mt-1 text-center text-lg font-extrabold tracking-tight sm:text-xl">Degree Certificate</p>
          <div className="mx-auto mt-3 h-1.5 w-3/4 rounded bg-line" />
          <div className="mx-auto mt-2 h-1.5 w-2/3 rounded bg-line" />
          <div className="mx-auto mt-2 h-1.5 w-1/2 rounded bg-line" />
        </div>

        {/* The stamps, landing one after another */}
        {destination.stamps.map((stamp, i) => (
          <div
            key={stamp.label}
            className="stamp absolute flex aspect-square w-[18%] flex-col items-center justify-center rounded-full border-[3px] border-double border-stamp text-stamp"
            style={
              {
                ...POSITIONS[i],
                "--tilt": `${TILTS[i]}deg`,
                "--delay": `${250 + i * 380}ms`,
              } as React.CSSProperties
            }
          >
            <span className="text-[0.55rem] font-bold leading-none opacity-70 sm:text-[0.6rem]">{i + 1}</span>
            <span className="mt-0.5 text-center text-[0.65rem] font-extrabold leading-tight sm:text-xs">
              {stamp.label}
            </span>
          </div>
        ))}
      </div>

      {/* Result, read out for screen readers too */}
      <div aria-live="polite" className="mt-4 rounded-2xl bg-white/70 p-4 ring-1 ring-line">
        <p className="font-semibold">
          {destination.route} for {destination.country}
          <span className="font-normal text-muted">, usually {destination.days}</span>
        </p>
        <ol className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted">
          {destination.stamps.map((s, i) => (
            <li key={s.label}>
              {i + 1}. {s.office}
              {i < destination.stamps.length - 1 && <span aria-hidden="true" className="ml-2 text-line">/</span>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
