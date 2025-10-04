"use client";

import React, { useState, useEffect } from "react";

interface UploadStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

interface UploadProgressModalProps {
  isOpen: boolean;
  progress: number;
  currentStep: number;
  onComplete?: () => void;
}

export const UploadProgressModal: React.FC<UploadProgressModalProps> = ({
  isOpen,
  progress,
  currentStep,
  onComplete,
}) => {
  const [steps, setSteps] = useState<UploadStep[]>([
    { 
      id: "upload", 
      title: "Uploading", 
      description: "Transferring your document to our secure servers",
      completed: false, 
      active: false 
    },
    {
      id: "extract",
      title: "Processing",
      description: "Analyzing and extracting content from your PDF",
      completed: false,
      active: false,
    },
    {
      id: "secure",
      title: "Securing",
      description: "Applying encryption and security measures",
      completed: false,
      active: false,
    },
  ]);

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Update steps based on current step
      setSteps((prevSteps) =>
        prevSteps.map((step, index) => ({
          ...step,
          completed: index < currentStep,
          active: index === currentStep,
        }))
      );
    } else {
      setIsAnimating(false);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      // Add a smooth completion delay
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          onComplete();
        }, 300);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className={`bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl transform transition-all duration-500 ease-out ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            {/* Document Icon with smooth animation */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                className={`w-10 h-10 text-blue-600 transition-all duration-500 ${
                  progress > 0 ? 'scale-110' : 'scale-100'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              
              {/* Animated progress ring */}
              <div className="absolute inset-0">
                <svg
                  className="w-20 h-20 transform -rotate-90 transition-all duration-300"
                  viewBox="0 0 36 36"
                >
                  {/* Background circle */}
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress circle */}
                  <path
                    className="text-blue-600 transition-all duration-500 ease-out"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    strokeDasharray={`${progress}, 100`}
                    strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
              
              {/* Percentage with smooth animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm transition-all duration-300">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {progress >= 100 ? "Complete!" : "Processing Document"}
            </h3>
            <p className="text-gray-600">
              {progress >= 100 
                ? "Your document is ready for editing" 
                : "Please wait while we prepare your PDF"
              }
            </p>
          </div>
        </div>

        {/* Steps with smooth animations */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start space-x-4 transition-all duration-500 ${
                step.completed
                  ? "opacity-100 scale-100"
                  : step.active
                  ? "opacity-100 scale-100"
                  : "opacity-60 scale-95"
              }`}
            >
              {/* Step indicator */}
              <div className="flex-shrink-0 mt-1">
                {step.completed ? (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                ) : step.active ? (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm font-medium">{index + 1}</span>
                  </div>
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-semibold text-lg transition-colors duration-300 ${
                    step.completed
                      ? "text-green-600"
                      : step.active
                      ? "text-blue-600"
                      : "text-gray-400"
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar with smooth animation */}
        <div className="mt-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Completion animation */}
        {progress >= 100 && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 text-green-600 font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Document ready!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};