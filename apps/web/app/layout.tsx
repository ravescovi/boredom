import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bordon.ai",
  description: "Generate safe, structured games from your context."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
