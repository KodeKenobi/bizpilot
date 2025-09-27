import type { Metadata } from "next";
import "./globals.css";
import LayoutClient from "@/components/layout/LayoutClient";

export const metadata: Metadata = {
  title: "All-in-One Converts",
  description:
    "Transform your media files with our intelligent conversion system",
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
