import type { RequestStatus } from "./types";
import { colors } from "@/constants/theme";

export function formatPrice(rupees: number) {
  return "₹" + rupees.toLocaleString("en-IN");
}

export function formatDate(iso: string, withTime = false) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (!withTime) return date;
  return `${date}, ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
}

export function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// The normal path a request takes (rejected is a separate ending)
export const STATUS_ORDER: RequestStatus[] = ["submitted", "in_review", "processing", "completed"];

export const STATUS_INFO: Record<RequestStatus, { label: string; color: string; bg: string; hint: string }> = {
  submitted: { label: "Submitted", color: colors.stamp, bg: colors.stampSoft, hint: "We've received your scans." },
  in_review: {
    label: "In review",
    color: colors.warn,
    bg: colors.warnSoft,
    hint: "Our team is checking your documents.",
  },
  processing: {
    label: "Processing",
    color: colors.stamp,
    bg: colors.stampSoft,
    hint: "Your documents are going through each office.",
  },
  completed: {
    label: "Completed",
    color: colors.ok,
    bg: colors.okSoft,
    hint: "Done. Your documents are on their way back.",
  },
  rejected: {
    label: "Needs attention",
    color: colors.danger,
    bg: colors.dangerSoft,
    hint: "Something needs fixing. See the note below.",
  },
};
