// The stamps a document needs before it is valid in each country.
// Used by the interactive "route finder" in the hero.
//
// Hague Convention countries accept an apostille (fewer steps).
// Other countries need the full embassy attestation chain.

export type Stamp = { label: string; office: string };

export type Destination = {
  code: string;
  country: string;
  route: "Apostille" | "Embassy attestation";
  days: string;
  stamps: Stamp[];
};

const notary: Stamp = { label: "Notary", office: "Notary public" };
const state: Stamp = { label: "State", office: "State HRD / Home Dept." };
const mea: Stamp = { label: "MEA", office: "Ministry of External Affairs" };

export const destinations: Destination[] = [
  {
    code: "AE",
    country: "UAE",
    route: "Embassy attestation",
    days: "10–15 working days",
    stamps: [notary, state, mea, { label: "Embassy", office: "UAE Embassy" }, { label: "MOFA", office: "UAE Ministry of Foreign Affairs" }],
  },
  {
    code: "QA",
    country: "Qatar",
    route: "Embassy attestation",
    days: "10–14 working days",
    stamps: [notary, state, mea, { label: "Embassy", office: "Qatar Embassy" }],
  },
  {
    code: "KW",
    country: "Kuwait",
    route: "Embassy attestation",
    days: "12–18 working days",
    stamps: [notary, state, mea, { label: "Embassy", office: "Kuwait Embassy" }],
  },
  {
    code: "DE",
    country: "Germany",
    route: "Apostille",
    days: "5–8 working days",
    stamps: [state, { label: "Apostille", office: "MEA apostille" }],
  },
  {
    code: "US",
    country: "USA",
    route: "Apostille",
    days: "5–8 working days",
    stamps: [state, { label: "Apostille", office: "MEA apostille" }],
  },
];
