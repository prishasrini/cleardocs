"use client";

import { useState } from "react";

// The same stages the backend uses for a request's status
const stages = [
  { key: "submitted", label: "Submitted", detail: "Scans received for degree certificate", when: "12 Oct, 10:42" },
  { key: "in_review", label: "In review", detail: "Documents checked. Please courier the original.", when: "13 Oct, 15:10" },
  { key: "processing", label: "Processing", detail: "At MEA for attestation", when: "18 Oct, 11:05" },
  { key: "completed", label: "Completed", detail: "Couriered back to you", when: "24 Oct, 17:30" },
];

// An interactive phone mockup of the ClearDocs app's request tracker
export default function TrackerDemo() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:gap-12">
      {/* Phone frame */}
      <div className="w-[270px] shrink-0 rounded-[2.6rem] bg-ink p-2.5 shadow-[0_40px_80px_-40px_rgba(22,35,63,0.6)]">
        <div className="overflow-hidden rounded-[2.1rem] bg-paper">
          <div className="flex justify-center pt-2.5">
            <div className="h-5 w-20 rounded-full bg-ink" />
          </div>
          <div className="px-5 pb-7 pt-4">
            <p className="text-xs text-muted">Request #CD-2041</p>
            <p className="text-lg font-extrabold leading-tight">Document Attestation</p>
            <p
              className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                step === stages.length - 1 ? "bg-ok/10 text-ok" : "bg-stamp-soft text-stamp"
              }`}
            >
              {stages[step].label}
            </p>

            <ol className="mt-5">
              {stages.map((s, i) => {
                const done = i <= step;
                const isLast = i === stages.length - 1;
                return (
                  <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0">
                    {/* The line between dots fills in as the request moves forward */}
                    {!isLast && (
                      <span className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-0.5 bg-line">
                        <span
                          className="block w-full bg-stamp transition-[height] duration-500 ease-out"
                          style={{ height: i < step ? "100%" : "0%" }}
                        />
                      </span>
                    )}
                    <span
                      className={`relative z-10 mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-all duration-300 ${
                        done ? "scale-110 border-stamp bg-stamp" : "border-line bg-white"
                      }`}
                      style={{ transitionDelay: done ? `${i * 120}ms` : "0ms" }}
                    />
                    <div className={`transition-opacity duration-300 ${done ? "opacity-100" : "opacity-40"}`}>
                      <p className="text-sm font-bold">{s.label}</p>
                      <p className="text-xs leading-snug text-muted">{s.detail}</p>
                      {done && <p className="mt-0.5 text-[0.65rem] text-muted">{s.when}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-sm text-center lg:text-left">
        <p className="text-sm text-muted">Try it: move the request along</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
          {stages.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(i)}
              aria-pressed={i === step}
              className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                i === step ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-5 leading-relaxed text-muted">
          In the real app, our team updates the status from the admin screen and your timeline changes the moment
          they do.
        </p>
      </div>
    </div>
  );
}
