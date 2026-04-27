import { useState, useEffect, useRef } from "react";

interface UseDraggableCanvasProps {
  initialHeight?: number;
  minHeight?: number;
  maxHeight?: number;
}

export const useDraggableCanvas = ({
  initialHeight = 700,
  minHeight = 400,
  maxHeight = 1200,
}: UseDraggableCanvasProps = {}) => {
  const [canvasHeight, setCanvasHeight] = useState(initialHeight);
  const [isCanvasResizing, setIsCanvasResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleCanvasResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCanvasResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (isCanvasResizing) {
      const deltaY = e.clientY - dragStart.y;
      const newHeight = Math.max(
        minHeight,
        Math.min(maxHeight, canvasHeight + deltaY)
      );
      setCanvasHeight(newHeight);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleGlobalMouseUp = () => {
    if (isCanvasResizing) {
      setIsCanvasResizing(false);
    }
  };

  useEffect(() => {
    if (isCanvasResizing) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isCanvasResizing, canvasHeight, dragStart, minHeight, maxHeight]);

  return {
    canvasHeight,
    isCanvasResizing,
    handleCanvasResizeStart,
  };
};

