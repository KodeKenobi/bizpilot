import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us - Get in Touch | Trevnoctilla",
  description:
    "Contact Trevnoctilla for support, feedback, partnership inquiries, or any questions about our file conversion tools. We typically respond within 24-48 hours.",
  keywords:
    "contact trevnoctilla, customer support, get help, feedback, partnership, contact form, support email",
  alternates: {
    canonical: "https://www.trevnoctilla.com/contact",
  },
  openGraph: {
    title: "Contact Us - Get in Touch | Trevnoctilla",
    description:
      "Contact Trevnoctilla for support, feedback, partnership inquiries, or any questions about our file conversion tools.",
    type: "website",
    url: "https://www.trevnoctilla.com/contact",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Trevnoctilla",
  description:
    "Contact Trevnoctilla for support, feedback, partnership inquiries, or any questions.",
  url: "https://www.trevnoctilla.com/contact",
  mainEntity: {
    "@type": "Organization",
    name: "Trevnoctilla",
    url: "https://www.trevnoctilla.com",
    logo: "https://www.trevnoctilla.com/logo.png",
    email: "info@trevnoctilla.com",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "info@trevnoctilla.com",
        url: "https://www.trevnoctilla.com/contact",
        availableLanguage: ["English"],
      },
      {
        "@type": "ContactPoint",
        contactType: "technical support",
        email: "info@trevnoctilla.com",
        url: "https://www.trevnoctilla.com/support",
      },
    ],
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.trevnoctilla.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Contact",
        item: "https://www.trevnoctilla.com/contact",
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ContactClient />
    </>
  );
}
