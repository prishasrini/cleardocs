// The same colours as the website, so the app and site feel like one product.
export const colors = {
  ink: "#16233f",
  inkSoft: "#2b3a5c",
  muted: "#586178",
  line: "#dce0e8",
  paper: "#f5f6f9",
  surface: "#ffffff",
  stamp: "#5b3fa0",
  stampSoft: "#ece8f6",
  ok: "#1e7a4e",
  okSoft: "#e3f2ea",
  danger: "#b42318",
  dangerSoft: "#fdecea",
  warn: "#9a5b00",
  warnSoft: "#fdf1dc",
};

export const radius = { sm: 10, md: 14, lg: 20, pill: 999 };

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const text = {
  title: { fontSize: 28, fontWeight: "800" as const, color: colors.ink, letterSpacing: -0.5 },
  heading: { fontSize: 20, fontWeight: "700" as const, color: colors.ink },
  body: { fontSize: 16, color: colors.inkSoft, lineHeight: 23 },
  small: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: "600" as const, color: colors.ink },
};
