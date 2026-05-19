import type { Metadata } from "next";
import { displayFont, uiFont } from "@/app/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Builder Network",
  description: "AI-powered builder network MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${uiFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
