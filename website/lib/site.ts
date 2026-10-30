// Values used across the site. Set them in .env.local (see .env.example).

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

// The Express backend. NEXT_PUBLIC_ means the browser can read it,
// which the contact form needs because it runs in the browser.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

export const SITE_NAME = "ClearDocs";

export const CONTACT = {
  email: "hello@cleardocs.dev",
  phone: "+91 98400 00000",
  hours: "Mon–Sat, 9:30am–6:30pm IST",
  city: "Chennai, India",
};
