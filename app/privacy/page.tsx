import { Metadata } from "next";
import Disclosures from "@/components/pages/disclaimers/page";

export const metadata: Metadata = {
  title: "Privacy Policy | Trevnoctilla",
  description:
    "Privacy Policy for Trevnoctilla's file conversion services. Learn how we collect, use, and protect your personal information and files.",
  keywords: "privacy policy, data protection, file security, trevnoctilla",
  openGraph: {
    title: "Privacy Policy | Trevnoctilla",
    description: "Privacy Policy for Trevnoctilla's file conversion services.",
    type: "website",
  },
};

export default function PrivacyPage() {
  return <Disclosures />;
}
