import { Metadata } from "next";
import Disclosures from "@/components/pages/disclaimers/page";

export const metadata: Metadata = {
  title: "Terms of Service | Trevnoctilla",
  description:
    "Terms of Service for Trevnoctilla's file conversion services. Learn about our user responsibilities, service availability, and usage policies.",
  keywords: "terms of service, file conversion, user agreement, trevnoctilla",
  openGraph: {
    title: "Terms of Service | Trevnoctilla",
    description:
      "Terms of Service for Trevnoctilla's file conversion services.",
    type: "website",
  },
};

export default function TermsPage() {
  return <Disclosures />;
}
