import type { Metadata } from "next";
import "./globals.css";
import LayoutClient from "@/components/layout/LayoutClient";

export const metadata: Metadata = {
  title: "Trevnoctilla - Complete PDF Toolkit",
  description:
    "Transform, edit, and optimize your PDFs with professional-grade tools in a sleek, modern interface.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
