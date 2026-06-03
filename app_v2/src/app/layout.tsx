import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skye Bridge Employee Hub",
  description: "Employee hub and sales forecasting platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
