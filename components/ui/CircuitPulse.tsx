import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  IconBrandPython,
  IconBrandJavascript,
  IconDatabase,
  IconBrandReact,
  IconBrandNodejs,
  IconBrandDjango,
  IconBrain,
  IconSql,
} from "@tabler/icons-react";

interface CircuitPulseProps {
  className?: string;
}

const pulseVariants = {
  dot1: {
    initial: { y: "-50%", x: "-50%" },
    animate: {
      y: ["-50%", "30%", "30%"],
      transition: {
        duration: 5,
        times: [0, 0.3, 1],
        repeat: Infinity,
        repeatDelay: 2,
        ease: "easeInOut",
      },
    },
  },
  dot2: {
    initial: { y: "-50%", x: "-50%" },
    animate: {
      y: ["-50%", "9.5%", "9.5%"],
      x: ["-50%", "-50%", "9.5%"],
      transition: {
        duration: 4,
        times: [0, 0.5, 1],
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: "easeInOut",
      },
    },
  },
  dot3: {
    initial: { y: "-50%", x: "-50%" },
    animate: {
      y: ["-50%", "30%", "30%"],
      transition: {
        duration: 3.5,
        times: [0, 0.4, 1],
        repeat: Infinity,
        repeatDelay: 2.5,
        ease: "easeInOut",
      },
    },
  },
  dot4: {
    initial: { y: "-50%", x: "-50%" },
    animate: {
      y: ["-50%", "9.5%", "9.5%"],
      x: ["-50%", "-50%", "9.5%"],
      transition: {
        duration: 4.5,
        times: [0, 0.6, 1],
        repeat: Infinity,
        repeatDelay: 1.8,
        ease: "easeInOut",
      },
    },
  },
  glow: {
    initial: { opacity: 0.4 },
    animate: {
      opacity: [0.4, 0.9, 0.4],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  },
};

// Programming language and tech icons using Tabler icons
const langIcons = [
  { name: "Python", color: "#FFD43B", Icon: IconBrandPython },
  { name: "JavaScript", color: "#F7DF1E", Icon: IconBrandJavascript },
  { name: "Database", color: "#00758F", Icon: IconDatabase },
  { name: "React", color: "#61DAFB", Icon: IconBrandReact },
  { name: "Node.js", color: "#68A063", Icon: IconBrandNodejs },
  { name: "Flask", color: "#FFFFFF", Icon: IconBrandDjango },
  { name: "AI", color: "#FF6B6B", Icon: IconBrain },
  { name: "SQL", color: "#CC2927", Icon: IconSql },
];

export function CircuitPulse({
  className,
}: CircuitPulseProps) {
  return (
    <div className={cn("relative h-[60vmin] w-[60vmin] max-h-[500px] max-w-[500px]", className)}>
      {[...Array(8)].map((_, i) => {
        const iconConfig = langIcons[i];
        return (
          <div
            key={i}
            className={cn(
              "pointer-events-none absolute h-1/2 w-1/2",
              i < 4
                ? "left-1/2 top-0 origin-bottom -translate-x-1/2"
                : "left-0 top-0 origin-bottom-right",
              i === 1 && "rotate-90",
              i === 2 && "rotate-180",
              i === 3 && "rotate-[270deg]",
              i === 5 && "-scale-x-100",
              i === 6 && "-scale-100",
              i === 7 && "-scale-y-100",
            )}
          >
          <motion.div
            className={cn(
              "opacity-50",
              i < 4
                ? "h-full w-[calc(50%+1px)] border-r-[3px]"
                : "absolute left-[calc(30%-1px)] top-[30%] h-[60%] w-[70%] rounded-br-xl border-b-[3px] border-l-[3px]",
            )}
            style={{ 
              borderColor: iconConfig.color,
              filter: `drop-shadow(0 0 5px ${iconConfig.color}60) drop-shadow(0 0 10px ${iconConfig.color}40)`,
            }}
            variants={pulseVariants.glow}
            initial="initial"
            animate="animate"
          />
            <motion.div
              className={cn(
                "absolute h-full w-full",
                i < 2
                  ? "left-1/2 top-[10%]"
                  : i < 4
                    ? "left-1/2 top-[10%]"
                    : i < 6
                      ? "left-[30%] top-[30%]"
                      : "left-[30%] top-[30%]",
              )}
              variants={
                i < 2
                  ? pulseVariants.dot1
                  : i < 4
                    ? pulseVariants.dot3
                    : i < 6
                      ? pulseVariants.dot2
                      : pulseVariants.dot4
              }
              initial="initial"
              animate="animate"
            >
              <motion.div
                className="absolute left-1/2 top-1/2 h-[12px] w-[12px] sm:h-[20px] sm:w-[20px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  backgroundColor: iconConfig.color,
                  boxShadow: `0 0 25px ${iconConfig.color}, 0 0 50px ${iconConfig.color}90, 0 0 75px ${iconConfig.color}60`,
                }}
                variants={pulseVariants.glow}
              />
            </motion.div>
            <motion.div
              className={cn(
                "absolute flex h-[70px] w-[70px] items-center justify-center rounded-full border-[3px]",
                i < 4
                  ? "left-1/2 top-[-35px] -translate-x-1/2"
                  : "left-[30%] top-[30%] -translate-x-1/2 -translate-y-1/2",
              )}
              style={{
                backgroundColor: "#111827",
                borderColor: iconConfig.color,
                boxShadow: `0 0 30px ${iconConfig.color}80, 0 0 60px ${iconConfig.color}40, inset 0 0 15px ${iconConfig.color}30`,
              }}
              whileHover={{ scale: 1.15 }}
              animate={{
                boxShadow: [
                  `0 0 30px ${iconConfig.color}80, 0 0 60px ${iconConfig.color}40, inset 0 0 15px ${iconConfig.color}30`,
                  `0 0 40px ${iconConfig.color}90, 0 0 80px ${iconConfig.color}50, inset 0 0 20px ${iconConfig.color}40`,
                  `0 0 30px ${iconConfig.color}80, 0 0 60px ${iconConfig.color}40, inset 0 0 15px ${iconConfig.color}30`,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div
                className={cn(
                  i === 1 && "rotate-90",
                  i === 2 && "rotate-180",
                  i === 3 && "rotate-[270deg]",
                  i === 5 && "-scale-x-100",
                  i === 6 && "-scale-100",
                  i === 7 && "-scale-y-100",
                )}
              >
                <iconConfig.Icon
                  className="h-10 w-10"
                  style={{ color: iconConfig.color }}
                />
              </div>
            </motion.div>
          </div>
        );
      })}
      <div className="absolute left-1/2 top-1/2 h-[25%] w-[25%] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-purple-900/50 to-blue-900/50"
          style={{
            boxShadow: `0 0 40px rgba(139, 92, 246, 0.4), 0 0 80px rgba(59, 130, 246, 0.2)`,
          }}
          variants={pulseVariants.glow}
          initial="initial"
          animate="animate"
        />
        <motion.div
          className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 bg-white"
          style={{
            borderColor: "#8b5cf6",
            boxShadow: `0 0 30px rgba(139, 92, 246, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.1)`,
          }}
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </motion.div>
      </div>
    </div>
  );
}
