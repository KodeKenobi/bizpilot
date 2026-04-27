"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FuzzyText from "@/components/FuzzyText";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden page-content">
      {/* Main Content with Header Spacing */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 pt-16 sm:pt-20 lg:pt-24 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center">
            {/* 404 Number */}
            <FuzzyText
              baseIntensity={0.2}
              hoverIntensity={0.5}
              enableHover={false}
            >
              404
            </FuzzyText>
          </div>

          {/* Fun Facts */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-16"
          >
            <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-white mb-4">
                Did you know?
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                The first 404 error was recorded in 1992 at CERN. The room where
                the web's central database was located was called "Room 404" -
                hence the error code!
              </p>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="mt-12"
          >
            <p className="text-gray-400 mb-4">Popular destinations:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: "PDF Tools", href: "/tools" },
                { name: "Video Converter", href: "/tools/video-converter" },
                { name: "Audio Converter", href: "/tools/audio-converter" },
                { name: "Image Tools", href: "/tools/image-tools" },
              ].map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="inline-block px-4 py-2 bg-gray-800/50 hover:bg-cyan-500/20 border border-gray-700/50 hover:border-cyan-400/50 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
