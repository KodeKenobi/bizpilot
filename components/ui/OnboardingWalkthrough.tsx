"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

export interface Step {
  title: string;
  description: string;
  targetId?: string;
}

interface OnboardingWalkthroughProps {
  steps: Step[];
  run: boolean;
  onComplete: () => void;
  onSkip?: () => void;
  pageKey?: string; // Add optional page key to track uniqueness
}

export default function OnboardingWalkthrough({
  steps,
  run,
  onComplete,
  onSkip,
  pageKey,
}: OnboardingWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
     // If a specific pageKey is provided, we can check if THAT specific page has been seen.
     // For now, we rely on the parent to pass 'run=true/false' based on their logic,
     // but we can use this for cleaner internal state management if needed.
    setIsVisible(run);
  }, [run]);

  const handleClose = () => {
    setIsVisible(false);
    if (onSkip) onSkip();
    else onComplete();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible || !run) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        {/* Backdrop */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] cursor-not-allowed pointer-events-auto"
            onClick={(e) => e.stopPropagation()} 
        />

        {/* Modal Container - Dynamically Positioned */}
        <ModalPositioner step={step} currentStep={currentStep} steps={steps} handleClose={handleClose} handlePrev={handlePrev} handleNext={handleNext} />
        
        {/* Highlight target element if exists */}
        {step.targetId && (
          <style jsx global>{`
            #${step.targetId} {
              position: relative;
              z-index: 10000 !important;
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5) !important;
              pointer-events: none !important;
              border-radius: 8px;
            }
          `}</style>
        )}
      </div>
    </AnimatePresence>
  );
}

interface ModalPositionerProps {
  step: Step;
  currentStep: number;
  steps: Step[];
  handleClose: () => void;
  handlePrev: () => void;
  handleNext: () => void;
}

function ModalPositioner({ step, currentStep, steps, handleClose, handlePrev, handleNext }: ModalPositionerProps) {
  const [position, setPosition] = useState<any>({ top: "50%", left: "50%", transform: "translate(-50%, -50%)" });

  useEffect(() => {
    if (!step.targetId) {
      setPosition({ top: "50%", left: "50%", transform: "translate(-50%, -50%)" });
      return;
    }

    const target = document.getElementById(step.targetId);
    if (!target) {
      setPosition({ top: "50%", left: "50%", transform: "translate(-50%, -50%)" });
      return;
    }

    const rect = target.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = 450; // Approx max-width
    const modalHeight = 300; // Approx height
    const gap = 20;

    // Check available spaces
    const spaceTop = rect.top;
    const spaceBottom = viewportHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = viewportWidth - rect.right;

    let newStyle: any = null;

    // Strict non-overlap logic. 
    // We default to Bottom Center, but if it doesn't fit, we try Top Center.
    // If neither fits vertically, we try side placement.
    
    if (spaceBottom > modalHeight + gap) {
      newStyle = {
        top: rect.bottom + gap,
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%)",
      };
    } else if (spaceTop > modalHeight + gap) {
      newStyle = {
        top: rect.top - modalHeight - gap,
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%)",
      };
    } else if (spaceRight > modalWidth + gap) {
        newStyle = {
            top: rect.top,
            left: rect.right + gap,
            transform: "none",
        };
    } else if (spaceLeft > modalWidth + gap) {
        newStyle = {
            top: rect.top,
            left: rect.left - modalWidth - gap,
            transform: "none",
        };
    } 
    
    // Fallback: If absolutely nothing fits (e.g. huge element on small screen),
    // force it to the bottom of the screen (fixed) and make sure it has a high z-index.
    // This essentially mimics a "toast" notification for edge cases.
    if (!newStyle) {
         newStyle = {
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            top: "auto", // Override top
          };
    }

    // Horizontal Containment (Simple Clamp)
    // We can't easily clamp with translateX(-50%) without ref, but this logic is safer than before.
    
    setPosition(newStyle);

    // Scroll logic: Scroll to the target, but with some padding so we see the modal too if possible.
    setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

  }, [step.targetId]);

  return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, ...position }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="fixed z-[10001] w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 shadow-2xl pointer-events-auto"
          style={{ 
             top: position.top,
             left: position.left,
             right: position.right,
             bottom: position.bottom,
             transform: position.transform,
             margin: 0
          }}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-3">
              {step.title}
            </h3>
            <p className="text-gray-400 leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? "w-6 bg-blue-500" : "w-1.5 bg-white/10"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              <button
                onClick={handleNext}
                id="walkthrough-next-btn"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
  );
}
