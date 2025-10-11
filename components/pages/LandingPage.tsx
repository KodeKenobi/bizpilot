"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, FileText, QrCode, Image } from "lucide-react";
import { useEffect, useState } from "react";

export default function LandingPage() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [cardOrder, setCardOrder] = useState([
    { text: "Convert videos to high-quality MP3 audio", icon: Play },
    { text: "Create animated GIFs from video content", icon: ArrowRight },
    { text: "Merge multiple PDF files seamlessly", icon: FileText },
    { text: "Generate custom QR codes instantly", icon: QrCode },
    { text: "Convert images between formats", icon: Image },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCardOrder((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 page-content">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'url("/platform-hero-bg.png") no-repeat center top',
            backgroundSize: "contain",
            backgroundPosition: "center -50px",
          }}
        ></div>
        {/* Background glow orbs */}
        <motion.div
          className="absolute w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px] top-[-200px] left-[-200px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        ></motion.div>
        <motion.div
          className="absolute w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[120px] top-[-100px] right-[-100px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        ></motion.div>
        <motion.div
          className="absolute w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] bottom-[-100px] left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        ></motion.div>
        <motion.div
          className="absolute w-[300px] h-[300px] bg-orange-500/15 rounded-full blur-[80px] top-1/2 right-1/4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        ></motion.div>

        {/* Hero Section */}
        <main className="relative z-20 px-6 lg:px-12 pt-24 pb-32">
          <div className="max-w-6xl mx-auto text-center">
            {/* Hero Text Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.02 }}
              className="relative mb-12"
            >
              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1, delay: 0.05 }}
                className="text-4xl lg:text-6xl font-bold text-white mb-8 leading-tight mt-14"
              >
                The only file conversion that{" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  works where you work
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1, delay: 0.1 }}
                className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
              >
                Transform your media files with our intelligent conversion
                system. From video to audio, PDF merging to QR generation,
                manage everything in one place.
              </motion.p>
            </motion.div>

            {/* Stacked Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.15 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative h-80 flex flex-col items-center">
                {cardOrder.map((card, index) => {
                  const IconComponent = card.icon;
                  return (
                    <motion.div
                      key={card.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: 1 + index * 0.1,
                      }}
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                        transition: { duration: 0.2 },
                      }}
                      className="absolute bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white transition-all duration-300 hover:bg-white/20 hover:border-white/40"
                      style={{
                        width: `${100 - index * 12}%`,
                        height: `${80 - index * 12}px`,
                        top: `${index * 8}%`,
                        zIndex: 5 - index,
                        padding: `${16 - index * 2}px 20px`,
                      }}
                    >
                      <div className="flex items-center justify-center h-full text-center">
                        <IconComponent className="text-gray-400 w-5 h-5 mr-3" />
                        <span className="text-sm opacity-90">{card.text}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-[-120px] flex flex-row items-center justify-center space-x-2 sm:space-x-6"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/tools"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-1 sm:space-x-2 group text-sm sm:text-base"
                >
                  <span>Start Converting</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="#demo"
                  className="text-gray-300 hover:text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-200 text-sm sm:text-base"
                >
                  Watch Demo
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </main>

        {/* Features Section */}
        <section
          id="features"
          className="relative z-10 px-6 lg:px-12 py-20 mt-[-100px]"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Everything you need to convert files
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                From simple file conversion to complex media processing,
                Trevnoctilla has you covered with powerful features.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 pt-8">
              {[
                {
                  icon: Play,
                  title: "Video Processing",
                  description:
                    "Convert videos to MP3 audio and create animated GIFs with high quality output.",
                  color: "from-green-500 to-emerald-500",
                },
                {
                  icon: FileText,
                  title: "Document Management",
                  description:
                    "Merge PDF files seamlessly and generate custom QR codes for any content.",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Image,
                  title: "Image Conversion",
                  description:
                    "Convert images between different formats with quality preservation.",
                  color: "from-purple-500 to-pink-500",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40, scale: 0.9, rotateY: -15 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 100,
                  }}
                  viewport={{ once: true }}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    rotateY: 5,
                    transition: { duration: 0.3 },
                  }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
                >
                  <motion.div
                    className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.2 + 0.3,
                      type: "spring",
                      stiffness: 200,
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <motion.h3
                    className="text-xl font-semibold text-white mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p
                    className="text-gray-400 leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
                  >
                    {feature.description}
                  </motion.p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-10 px-6 lg:px-12 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-8 text-center">
              {[
                { number: "5+", label: "File Types" },
                { number: "∞", label: "Unlimited Conversions" },
                { number: "24/7", label: "Access" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 100,
                  }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <motion.div
                    className="text-4xl font-bold text-white mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.2 + 0.3,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    {stat.number}
                  </motion.div>
                  <motion.div
                    className="text-gray-400"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
                  >
                    {stat.label}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 px-6 lg:px-12 py-12 border-t border-white/10"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <motion.div
              className="flex items-center space-x-3 mb-4 md:mb-0"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.span
                className="text-xl font-bold text-white"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Trevnoctilla
              </motion.span>
            </motion.div>

            <motion.div
              className="flex items-center space-x-6 text-gray-400"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {["Privacy", "Terms", "Support"].map((link, index) => (
                <motion.div
                  key={link}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <Link
                    href={`/${link.toLowerCase()}`}
                    className="hover:text-white transition-colors"
                  >
                    {link}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </>
  );
}
