"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Settings, HelpCircle, Command, X } from "lucide-react";

interface FloatingNavProps {
  onQuickTest: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenCommandPalette: () => void;
}

export function FloatingNav({
  onQuickTest,
  onOpenSettings,
  onOpenHelp,
  onOpenCommandPalette,
}: FloatingNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: Plus,
      label: "Quick Test",
      action: onQuickTest,
      color: "bg-[#8b5cf6] hover:bg-[#7c3aed]",
    },
    {
      icon: Settings,
      label: "Settings",
      action: onOpenSettings,
      color: "bg-[#06b6d4] hover:bg-[#0891b2]",
    },
    {
      icon: HelpCircle,
      label: "Help",
      action: onOpenHelp,
      color: "bg-[#10b981] hover:bg-[#059669]",
    },
    {
      icon: Command,
      label: "Commands",
      action: onOpenCommandPalette,
      color: "bg-[#f59e0b] hover:bg-[#d97706]",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4 space-y-3"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-sm text-white bg-[#1a1a1a] px-3 py-1 rounded-lg border border-[#2a2a2a] whitespace-nowrap">
                  {item.label}
                </span>
                <button
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className={`w-12 h-12 ${item.color} text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl`}
                >
                  <item.icon className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl ${
          isOpen
            ? "bg-[#ef4444] hover:bg-[#dc2626]"
            : "bg-[#8b5cf6] hover:bg-[#7c3aed]"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
