"use client";

import { motion } from "framer-motion";
import { Cookie, Shield, Settings, Eye, Database, Lock } from "lucide-react";

export default function CookiesPage() {
  const cookieTypes = [
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Essential Cookies",
      description:
        "These cookies are necessary for the website to function and cannot be switched off in our systems.",
      examples: [
        "Authentication and login status",
        "Security and fraud prevention",
        "Load balancing and performance",
        "User preferences and settings",
      ],
      necessary: true,
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Analytics Cookies",
      description:
        "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
      examples: [
        "Page views and user behavior",
        "Traffic sources and referrals",
        "Popular content and features",
        "Error tracking and debugging",
      ],
      necessary: false,
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Functional Cookies",
      description:
        "These cookies enable enhanced functionality and personalization, such as remembering your preferences.",
      examples: [
        "Language and region settings",
        "Theme preferences (dark/light mode)",
        "Tool usage history",
        "Customized interface settings",
      ],
      necessary: false,
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Security Cookies",
      description:
        "These cookies are essential for maintaining the security and integrity of our services.",
      examples: [
        "CSRF protection tokens",
        "Session management",
        "Rate limiting and abuse prevention",
        "API authentication tokens",
      ],
      necessary: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 page-content">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-4">Cookie Policy</h1>
        <p className="text-gray-300">
          Learn about how we use cookies and similar technologies to enhance
          your experience on Trevnoctilla.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              What Are Cookies?
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Cookies are small text files that are stored on your device when
              you visit our website. They help us provide you with a better
              experience by remembering your preferences and understanding how
              you use our services.
            </p>
            <p className="text-gray-300 leading-relaxed">
              We use cookies to make our website work properly, improve
              performance, and provide personalized features. You can control
              which cookies you accept through your browser settings.
            </p>
          </div>
        </motion.div>

        {/* Cookie Types */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Types of Cookies We Use
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {cookieTypes.map((cookie, index) => (
              <motion.div
                key={cookie.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
              >
                <div className="flex items-start mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                      cookie.necessary
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : "bg-gradient-to-r from-blue-500 to-cyan-500"
                    }`}
                  >
                    {cookie.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {cookie.title}
                      </h3>
                      {cookie.necessary && (
                        <span className="ml-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {cookie.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-white mb-2">
                    Examples:
                  </h4>
                  <ul className="space-y-1">
                    {cookie.examples.map((example, idx) => (
                      <li
                        key={`${cookie.title}-example-${idx}`}
                        className="flex items-center text-gray-400 text-sm"
                      >
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-3"></div>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cookie Management */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Managing Your Cookie Preferences
          </h2>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Browser Settings
                </h3>
                <p className="text-gray-300 mb-4">
                  You can control cookies through your browser settings. Most
                  browsers allow you to:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                    Block all cookies
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                    Block third-party cookies
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                    Delete existing cookies
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                    Set cookie preferences
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Impact of Disabling Cookies
                </h3>
                <p className="text-gray-300 mb-4">
                  Please note that disabling certain cookies may affect your
                  experience:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Some features may not work properly
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    You may need to re-enter preferences
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Performance may be reduced
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Security features may be limited
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Third-Party Services */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Third-Party Services
          </h2>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
            <p className="text-gray-300 mb-6">
              We may use third-party services that set their own cookies. These
              services help us provide better functionality and analytics:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Analytics Services
                </h4>
                <p className="text-gray-400 text-sm">
                  We use analytics services to understand how our website is
                  used and improve performance.
                </p>
              </div>

              <div className="border border-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">CDN Services</h4>
                <p className="text-gray-400 text-sm">
                  Content delivery networks may set cookies to optimize content
                  delivery and caching.
                </p>
              </div>

              <div className="border border-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Security Services
                </h4>
                <p className="text-gray-400 text-sm">
                  Security services may set cookies to protect against fraud and
                  abuse.
                </p>
              </div>

              <div className="border border-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Payment Processing
                </h4>
                <p className="text-gray-400 text-sm">
                  Payment processors may set cookies to ensure secure
                  transactions.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Questions About Our Cookie Policy?
            </h2>
            <p className="text-gray-300 mb-6">
              If you have any questions about how we use cookies or this policy,
              please contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@trevnoctilla.com"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300"
              >
                Contact Us
              </a>
              <a
                href="/privacy"
                className="border-2 border-gray-600 hover:border-cyan-400 text-gray-300 hover:text-white font-bold px-8 py-3 rounded-xl transition-all duration-300"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
