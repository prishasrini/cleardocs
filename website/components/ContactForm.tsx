"use client";

import { useState } from "react";
import { services } from "@/lib/services";
import { API_URL } from "@/lib/site";

type Fields = { name: string; email: string; phone: string; service: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Checks the form and returns a message for each field that has a problem
function validate(f: Fields): Errors {
  const errors: Errors = {};
  if (!f.name.trim()) errors.name = "Enter your name.";
  if (!EMAIL_PATTERN.test(f.email)) errors.email = "Enter an email like name@example.com.";
  if (f.phone && !/^[+\d\s-]{7,20}$/.test(f.phone)) errors.phone = "Use digits, spaces, + or - only.";
  if (f.message.trim().length < 10) errors.message = "Tell us a little more (at least 10 characters).";
  return errors;
}

export default function ContactForm({ initialService = "" }: { initialService?: string }) {
  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    phone: "",
    service: initialService,
    message: "",
  });
  // Only show a field's error after the user has left that field (or tried to submit)
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");

  const errors = validate(fields);

  function update(name: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, message: true });
    if (Object.keys(errors).length > 0) return;

    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch(`${API_URL}/api/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setServerError(
        err instanceof TypeError
          ? "We couldn't reach the server. Check your connection and try again."
          : (err as Error).message
      );
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-white p-10 text-center ring-1 ring-line" role="status">
        <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="29" fill="none" stroke="var(--color-ok)" strokeWidth="3" />
          <path
            d="M20 33l8 8 16-17"
            fill="none"
            stroke="var(--color-ok)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="40"
            strokeDashoffset="40"
            style={{ animation: "draw 500ms 150ms ease-out forwards" }}
          />
        </svg>
        <h2 className="mt-5 text-2xl font-extrabold">Message sent</h2>
        <p className="mt-2 max-w-sm text-muted">
          Thanks, {fields.name.split(" ")[0]}. We&apos;ll reply to {fields.email} within one working day.
        </p>
      </div>
    );
  }

  const showError = (name: keyof Fields) => (touched[name] ? errors[name] : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-3xl bg-white p-6 ring-1 ring-line sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={showError("name")} id="name">
          <input
            id="name"
            className="field"
            autoComplete="name"
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            aria-invalid={!!showError("name")}
            aria-describedby={showError("name") ? "name-error" : undefined}
          />
        </Field>
        <Field label="Email" error={showError("email")} id="email">
          <input
            id="email"
            type="email"
            className="field"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            aria-invalid={!!showError("email")}
            aria-describedby={showError("email") ? "email-error" : undefined}
          />
        </Field>
        <Field label="Phone (optional)" error={showError("phone")} id="phone">
          <input
            id="phone"
            type="tel"
            className="field"
            autoComplete="tel"
            value={fields.phone}
            onChange={(e) => update("phone", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            aria-invalid={!!showError("phone")}
            aria-describedby={showError("phone") ? "phone-error" : undefined}
          />
        </Field>
        <Field label="Service" id="service">
          <select
            id="service"
            className="field"
            value={fields.service}
            onChange={(e) => update("service", e.target.value)}
          >
            <option value="">Not sure yet</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="What do you need?" error={showError("message")} id="message">
        <textarea
          id="message"
          rows={5}
          className="field resize-y"
          placeholder="For example: degree certificate attestation for a job in Dubai"
          value={fields.message}
          onChange={(e) => update("message", e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, message: true }))}
          aria-invalid={!!showError("message")}
          aria-describedby={showError("message") ? "message-error" : undefined}
        />
      </Field>

      {status === "error" && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {serverError}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

// Label + input + error message, reused for every field
function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
