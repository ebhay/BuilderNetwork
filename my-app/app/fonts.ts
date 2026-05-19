import { Inter, Space_Grotesk } from "next/font/google";

export const uiFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui",
});

export const displayFont = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});
