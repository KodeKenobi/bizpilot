"use client";

import { useRef, useEffect, useState } from "react";

interface SignatureCanvasProps {
  onSignatureChange: (signatureData: string) => void;
  width?: number;
  height?: number;
  showSizeControls?: boolean;
  onSizeChange?: (width: number, height: number) => void;
}

export const SignatureCanvas = ({
  onSignatureChange,
  width = 400,
  height = 200,
  showSizeControls = false,
  onSizeChange,
}: SignatureCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(width);
  const [canvasHeight, setCanvasHeight] = useState(height);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Set drawing styles
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Clear canvas with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }, [canvasWidth, canvasHeight]);

  // Add touch event listeners with passive: false to allow preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let drawing = false;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      drawing = true;
      setIsDrawing(true);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!drawing) return;

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (drawing) {
        drawing = false;
        setIsDrawing(false);
        setHasSignature(true);
        const canvas = canvasRef.current;
        if (canvas) {
          const signatureData = canvas.toDataURL("image/png");
          onSignatureChange(signatureData);
        }
      }
    };

    // Add touch listeners with passive: false
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [onSignatureChange]);

  // Update canvas size when props change
  useEffect(() => {
    setCanvasWidth(width);
    setCanvasHeight(height);
  }, [width, height]);

  // Get coordinates from mouse or touch event
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0]?.clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoordinates(e);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoordinates(e);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (
    e?:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (e) e.preventDefault();
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
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    setHasSignature(false);
    onSignatureChange("");
  };

  const handleSizeChange = (newWidth: number, newHeight: number) => {
    setCanvasWidth(newWidth);
    setCanvasHeight(newHeight);
    if (onSizeChange) {
      onSizeChange(newWidth, newHeight);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {showSizeControls && (
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-center">
            <label className="text-sm text-gray-600 mb-1">Width</label>
            <input
              type="range"
              min="200"
              max="800"
              value={canvasWidth}
              onChange={(e) =>
                handleSizeChange(parseInt(e.target.value), canvasHeight)
              }
              className="w-20"
            />
            <span className="text-xs text-gray-500">{canvasWidth}px</span>
          </div>
          <div className="flex flex-col items-center">
            <label className="text-sm text-gray-600 mb-1">Height</label>
            <input
              type="range"
              min="100"
              max="400"
              value={canvasHeight}
              onChange={(e) =>
                handleSizeChange(canvasWidth, parseInt(e.target.value))
              }
              className="w-20"
            />
            <span className="text-xs text-gray-500">{canvasHeight}px</span>
          </div>
        </div>
      )}

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
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
