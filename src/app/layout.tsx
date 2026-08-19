import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pinterest Integration",
  description: "Official Pinterest API integration for visual references",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
