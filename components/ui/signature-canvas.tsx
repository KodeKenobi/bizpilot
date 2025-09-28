"use client";

import { useRef, useEffect, useState } from "react";

interface SignatureCanvasProps {
  onSignatureChange: (signatureData: string) => void;
  width?: number;
  height?: number;
}

export const SignatureCanvas = ({
  onSignatureChange,
  width = 400,
  height = 200,
}: SignatureCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Set drawing styles
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Clear canvas with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }, [width, height]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setHasSignature(true);
      updateSignature();
    }
  };

  const updateSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL("image/png");
    onSignatureChange(signatureData);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    setHasSignature(false);
    onSignatureChange("");
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ width: `${width}px`, height: `${height}px` }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={clearSignature}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
        >
          Clear
        </button>
        <button
          onClick={updateSignature}
          disabled={!hasSignature}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
        >
          Update Signature
        </button>
      </div>

      {hasSignature && (
        <p className="text-green-600 text-sm">✓ Signature ready</p>
      )}
    </div>
  );
};
