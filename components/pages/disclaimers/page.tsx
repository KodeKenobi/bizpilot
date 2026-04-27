"use client";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const scrollToBottom = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: "smooth",
  });
};

function DisclosuresContent() {
  const searchParams = useSearchParams();
  const [content, setContent] = useState("Terms");
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const contentParam = searchParams.get("content");
    const pathname = window.location.pathname;

    if (pathname.includes("/privacy")) {
      setContent("Privacy");
    } else if (pathname.includes("/terms")) {
      setContent("Terms");
    } else if (contentParam === "privacy") {
      setContent("Privacy");
    } else if (contentParam === "terms") {
      setContent("Terms");
    } else {
      setContent("Terms");
    }
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = ["Terms", "Privacy"];

  const returnContent = () => {
    switch (content) {
      case "Terms":
        return (
          <>
            <h2 className="text-white text-3xl font-bold mb-6">
              Terms of Service
            </h2>
            <hr className="border-gray-600 mb-8" />
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  1. Acceptance of Terms
                </h3>
                <p className="text-sm leading-relaxed">
                  By accessing and using Trevnoctilla's file conversion
                  services, you accept and agree to be bound by the terms and
                  provision of this agreement. If you do not agree to abide by
                  the above, please do not use this service.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  2. Description of Service
                </h3>
                <p className="text-sm leading-relaxed">
                  Trevnoctilla provides online file conversion services
                  including but not limited to video, audio, image, and PDF
                  conversion tools. These services are provided "as is" and we
                  make no warranties regarding the accuracy, reliability, or
                  availability of the service.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  3. User Responsibilities
                </h3>
                <p className="text-sm leading-relaxed mb-3">
                  Users are responsible for:
                </p>
                <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                  <li>
                    Ensuring they have the right to convert and download the
                    files they upload
                  </li>
                  <li>
                    Not uploading malicious, illegal, or copyrighted content
                    without permission
                  </li>
                  <li>Complying with all applicable laws and regulations</li>
                  <li>Maintaining the security of their account credentials</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  4. File Processing and Privacy
                </h3>
                <p className="text-sm leading-relaxed">
                  Files uploaded to our service are processed automatically and
                  may be temporarily stored on our servers during conversion. We
                  do not claim ownership of your files and will not use them for
                  any purpose other than providing the conversion service. Files
                  are automatically deleted after processing.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  5. Service Availability
                </h3>
                <p className="text-sm leading-relaxed">
                  We strive to maintain high service availability but do not
                  guarantee uninterrupted access. We reserve the right to
                  modify, suspend, or discontinue the service at any time
                  without notice.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  6. Limitation of Liability
                </h3>
                <p className="text-sm leading-relaxed">
                  Trevnoctilla shall not be liable for any direct, indirect,
                  incidental, special, or consequential damages resulting from
                  the use or inability to use our service, including but not
                  limited to data loss, file corruption, or service
                  interruptions.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  7. Prohibited Uses
                </h3>
                <p className="text-sm leading-relaxed mb-3">
                  You may not use our service to:
                </p>
                <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                  <li>
                    Upload or process illegal, harmful, or malicious content
                  </li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>
                    Use the service for commercial purposes without permission
                  </li>
                  <li>
                    Upload copyrighted material without proper authorization
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  8. Changes to Terms
                </h3>
                <p className="text-sm leading-relaxed">
                  We reserve the right to modify these terms at any time.
                  Changes will be effective immediately upon posting. Your
                  continued use of the service constitutes acceptance of the
                  modified terms.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  9. Contact Information
                </h3>
                <p className="text-sm leading-relaxed">
                  If you have any questions about these Terms of Service, please
                  contact us at{" "}
                  <a
                    href="mailto:info@trevnoctilla.com"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    info@trevnoctilla.com
                  </a>
                </p>
              </div>
            </div>
          </>
        );

      case "Privacy":
        return (
          <>
            <h2 className="text-white text-3xl font-bold mb-6">
              Privacy Policy
            </h2>
            <hr className="border-gray-600 mb-8" />
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  1. Information We Collect
                </h3>
                <p className="text-sm leading-relaxed mb-3">
                  We collect information you provide directly to us, such as
                  when you:
                </p>
                <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                  <li>Upload files for conversion</li>
                  <li>Create an account or register for our services</li>
                  <li>Contact us for support</li>
                  <li>Subscribe to our newsletter or updates</li>
                </ul>
                <p className="text-sm leading-relaxed mt-3">
                  This may include your name, email address, and any files you
                  choose to upload for processing.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  2. File Processing and Storage
                </h3>
                <p className="text-sm leading-relaxed">
                  Files uploaded to our service are processed automatically and
                  temporarily stored on our secure servers during conversion. We
                  do not claim ownership of your files and will not use them for
                  any purpose other than providing the conversion service. Files
                  are automatically deleted from our servers after processing is
                  complete.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  3. How We Use Your Information
                </h3>
                <p className="text-sm leading-relaxed mb-3">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                  <li>Provide and maintain our file conversion services</li>
                  <li>Process your file conversion requests</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Improve our services and develop new features</li>
                  <li>Monitor and analyze usage patterns</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  4. Information Sharing
                </h3>
                <p className="text-sm leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal
                  information to third parties without your consent, except as
                  described in this policy. We may share your information in the
                  following circumstances:
                </p>
                <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4 mt-3">
                  <li>
                    With service providers who assist us in operating our
                    website and conducting our business
                  </li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with a business transfer or acquisition</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  5. Data Security
                </h3>
                <p className="text-sm leading-relaxed">
                  We implement appropriate security measures to protect your
                  personal information against unauthorized access, alteration,
                  disclosure, or destruction. However, no method of transmission
                  over the internet or electronic storage is 100% secure, and we
                  cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  6. Cookies and Tracking
                </h3>
                <p className="text-sm leading-relaxed">
                  We use cookies and similar tracking technologies to enhance
                  your experience on our website. You can control cookie
                  settings through your browser preferences. Disabling cookies
                  may affect the functionality of our service.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  7. Third-Party Services
                </h3>
                <p className="text-sm leading-relaxed">
                  Our service may contain links to third-party websites or
                  services. We are not responsible for the privacy practices of
                  these third parties. We encourage you to read their privacy
                  policies before providing any personal information.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  8. Children's Privacy
                </h3>
                <p className="text-sm leading-relaxed">
                  Our service is not intended for children under 13 years of
                  age. We do not knowingly collect personal information from
                  children under 13. If you are a parent or guardian and believe
                  your child has provided us with personal information, please
                  contact us.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  9. International Users
                </h3>
                <p className="text-sm leading-relaxed">
                  If you are accessing our service from outside the United
                  States, please be aware that your information may be
                  transferred to, stored, and processed in the United States
                  where our servers are located.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  10. Changes to This Policy
                </h3>
                <p className="text-sm leading-relaxed">
                  We may update this privacy policy from time to time. We will
                  notify you of any changes by posting the new policy on this
                  page and updating the "Last Updated" date. Your continued use
                  of our service after any changes constitutes acceptance of the
                  updated policy.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  11. Contact Us
                </h3>
                <p className="text-sm leading-relaxed">
                  If you have any questions about this Privacy Policy, please
                  contact us at{" "}
                  <a
                    href="mailto:info@trevnoctilla.com"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    info@trevnoctilla.com
                  </a>
                </p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors mb-6"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </Link>
            <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 w-fit">
              {links.map((item: string) => (
                <button
                  key={item}
                  onClick={() => setContent(item)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    item === content
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            {returnContent()}
          </div>
        </div>
      </div>

      <button
        onClick={isAtTop ? scrollToBottom : scrollToTop}
        className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        aria-label={isAtTop ? "Go to bottom" : "Back to top"}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isAtTop ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"}
          />
        </svg>
      </button>
    </div>
  );
}

export default function Disclosures() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DisclosuresContent />
    </Suspense>
  );
}
