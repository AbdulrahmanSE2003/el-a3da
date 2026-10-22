import type { Qa3daAccentTheme } from "@/lib/qa3da-theme"

export const THEME_STYLES: Record<
  Qa3daAccentTheme,
  {
    surface: string
    foreground: string
    muted: string
    accent: string
    border: string
    radius: string
    shadow: string
  }
> = {
  cafe: {
    surface: "#F5F0E8",
    foreground: "#0F0D0A",
    muted: "#2C2820",
    accent: "#B5832A",
    border: "#0F0D0A",
    radius: "0px",
    shadow: "3px 3px 0 #0F0D0A",
  },
  "original-green": {
    surface: "#111A0D",
    foreground: "#F0F5E8",
    muted: "#C0D0AE",
    accent: "#A1FF00",
    border: "#405B2B",
    radius: "8px",
    shadow: "0 3px 12px rgb(0 0 0 / 22%)",
  },
  "night-blue": {
    surface: "#101624",
    foreground: "#F0EFF8",
    muted: "#B7BCE6",
    accent: "#B9A6FF",
    border: "#45466B",
    radius: "10px",
    shadow: "0 3px 12px rgb(0 0 0 / 20%)",
  },
  "ember-red": {
    surface: "#211213",
    foreground: "#FFF0EE",
    muted: "#E5BFC0",
    accent: "#FF626B",
    border: "#6D3A40",
    radius: "10px",
    shadow: "0 3px 12px rgb(0 0 0 / 20%)",
  },
  "velvet-purple": {
    surface: "#1C0D2E",
    foreground: "#F8F0FF",
    muted: "#D1B3F2",
    accent: "#A855F7",
    border: "#6B21A8",
    radius: "10px",
    shadow: "0 3px 12px rgb(0 0 0 / 20%)",
  },
}
