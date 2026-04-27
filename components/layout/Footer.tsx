"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Play,
  Zap,
  Image,
  QrCode,
  Mail,
  ArrowUp,
  HelpCircle,
  MessageSquare,
  Code,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import { useNavigation } from "@/contexts/NavigationContext";

export default function Footer() {
  const { navigateTo } = useNavigation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const tools = [
    { name: "Video Converter", page: "video-converter", icon: Play },
    { name: "Audio Converter", page: "audio-converter", icon: Zap },
    { name: "Image Converter", page: "image-converter", icon: Image },
    { name: "PDF Tools", page: "pdf-tools", icon: FileText },
    { name: "QR Generator", page: "qr-generator", icon: QrCode },
  ];

  const support = [
    { name: "Features", href: "/features", icon: Zap },
    { name: "Help Center", href: "/support", icon: HelpCircle },
    { name: "Contact Us", href: "/contact", icon: MessageSquare },
    { name: "API Documentation", href: "/api-docs", icon: Code },
  ];

  const legal = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ];

  return (
    <footer className="relative bg-footer">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center md:text-left">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <img
                    src="/logo.png"
                    alt="Trevnoctilla Logo"
                    className="w-10 h-10"
                  />
                  <h3 className="text-2xl font-bold text-foreground dark:text-white">
                    Trevnoctilla
                  </h3>
                </div>

                <p className="text-muted-foreground dark:text-gray-400 leading-relaxed">
                  The ultimate file conversion platform. Transform, convert, and
                  optimize your files with professional-grade tools.
                </p>

                {/* Share This Site */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Share Trevnoctilla:</p>
                  <div className="flex items-center justify-center md:justify-start space-x-3">
                    <a
                      href="https://twitter.com/intent/tweet?url=https://www.trevnoctilla.com&text=Check%20out%20Trevnoctilla%20-%20Free%20PDF%20editor%20and%20file%20converter!"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800/50 hover:bg-[#1DA1F2]/20 border border-gray-700/50 hover:border-[#1DA1F2]/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1DA1F2] transition-all duration-300"
                      aria-label="Share on Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href="https://www.facebook.com/sharer/sharer.php?u=https://www.trevnoctilla.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800/50 hover:bg-[#1877F2]/20 border border-gray-700/50 hover:border-[#1877F2]/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1877F2] transition-all duration-300"
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a
                      href="https://www.linkedin.com/shareArticle?mini=true&url=https://www.trevnoctilla.com&title=Trevnoctilla%20-%20Free%20PDF%20Editor&summary=Free%20PDF%20editor%20and%20file%20converter%20-%20merge,%20split,%20sign%20PDFs%20and%20convert%20videos,%20audio,%20images."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800/50 hover:bg-[#0A66C2]/20 border border-gray-700/50 hover:border-[#0A66C2]/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#0A66C2] transition-all duration-300"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href="https://api.whatsapp.com/send?text=Check%20out%20Trevnoctilla%20-%20Free%20PDF%20editor%20and%20file%20converter!%20https://www.trevnoctilla.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800/50 hover:bg-[#25D366]/20 border border-gray-700/50 hover:border-[#25D366]/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#25D366] transition-all duration-300"
                      aria-label="Share on WhatsApp"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Tools Section */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-6"
              >
                <h4 className="text-lg font-semibold text-foreground dark:text-white">
                  Tools
                </h4>
                <ul className="space-y-3">
                  {tools.map((tool, index) => (
                    <motion.li
                      key={tool.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => navigateTo(tool.page as any)}
                        className="flex items-center justify-center md:justify-start space-x-3 text-muted-foreground dark:text-gray-400 hover:text-white transition-colors group w-full"
                      >
                        <tool.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>{tool.name}</span>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Support Section */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <h4 className="text-lg font-semibold text-foreground dark:text-white">
                  Support
                </h4>
                <ul className="space-y-3">
                  {support.map((item, index) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <a
                        href={item.href}
                        className="flex items-center justify-center md:justify-start space-x-3 text-muted-foreground dark:text-gray-400 hover:text-white transition-colors group"
                      >
                        <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>{item.name}</span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Contact Section */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-6"
              >
                <h4 className="text-lg font-semibold text-foreground dark:text-white">
                  Get in Touch
                </h4>
                <div className="space-y-4">
                  <a
                    href="/contact"
                    className="flex items-center justify-center md:justify-start space-x-3 text-muted-foreground dark:text-gray-400 hover:text-white transition-colors group"
                  >
                    <MessageSquare className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    <span>Contact Form</span>
                  </a>
                  <div className="flex items-center justify-center md:justify-start space-x-3 text-muted-foreground dark:text-gray-400">
                    <Mail className="w-5 h-5 text-white" />
                    <a
                      href="mailto:info@trevnoctilla.com"
                      className="hover:text-white transition-colors"
                    >
                      info@trevnoctilla.com
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-between text-center md:text-left space-y-4 md:space-y-0">
              {/* Copyright */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-muted-foreground dark:text-gray-400 text-sm"
              >
                © {new Date().getFullYear()} Trevnoctilla. All rights reserved.
              </motion.div>

              {/* Legal Links */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex flex-wrap items-center justify-center md:justify-start space-x-6 text-sm"
              >
                {legal.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground dark:text-gray-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    {item.name}
                  </motion.a>
                ))}
              </motion.div>

              {/* Back to Top Button */}
              <motion.button
                onClick={scrollToTop}
                className="flex items-center space-x-2 text-muted-foreground dark:text-gray-400 hover:text-white transition-colors group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span className="text-sm">Back to top</span>
                <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
