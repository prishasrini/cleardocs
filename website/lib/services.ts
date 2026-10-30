// The services shown on the website.
// The backend has the same list in backend/data/services.js (the app reads it from the API).
// Keeping a copy here means the marketing pages build and load fast without calling the API.

export type Service = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  turnaround: string;
  startingPrice: number;
  requiredDocuments: string[];
};

export const services: Service[] = [
  {
    slug: "document-attestation",
    title: "Document Attestation",
    summary: "Get degree, birth and marriage certificates attested for use abroad.",
    description:
      "We handle the full attestation chain: notary, state Home or HRD department, MEA, and the destination country's embassy. You upload clear scans, we tell you which originals to courier, and you can track each stage in the app.",
    turnaround: "7–15 working days",
    startingPrice: 2500,
    requiredDocuments: ["Original certificate", "Passport copy", "Visa copy (if available)"],
  },
  {
    slug: "visa-documentation",
    title: "Visa Documentation",
    summary: "Checklists, form filling and document review for work and visit visas.",
    description:
      "We review your documents against the destination country's current checklist, fill the application forms with you, and flag anything missing before you submit, so your application is not rejected for a paperwork error.",
    turnaround: "3–5 working days",
    startingPrice: 1500,
    requiredDocuments: ["Passport copy", "Passport-size photo", "Offer letter or invitation"],
  },
  {
    slug: "translation-services",
    title: "Certified Translation",
    summary: "Certified translations of official documents into English, Arabic and more.",
    description:
      "Certified translators translate your documents and stamp them for official use. Translations are accepted by embassies, universities and government offices.",
    turnaround: "2–4 working days",
    startingPrice: 800,
    requiredDocuments: ["Clear scan of the original document"],
  },
  {
    slug: "apostille",
    title: "Apostille",
    summary: "MEA apostille for countries in the Hague Convention.",
    description:
      "For Hague Convention countries, an apostille from the Ministry of External Affairs replaces embassy attestation. We prepare the documents, submit them, and send them back to you.",
    turnaround: "5–10 working days",
    startingPrice: 2000,
    requiredDocuments: ["Original document", "Passport copy"],
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function formatPrice(rupees: number) {
  return "₹" + rupees.toLocaleString("en-IN");
}
