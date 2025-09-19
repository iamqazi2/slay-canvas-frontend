import { useState, useCallback, useEffect } from "react";

interface UseDragAndDropProps {
  initialPosition?: { x: number; y: number };
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const useDragAndDrop = ({
  initialPosition = { x: 100, y: 100 },
  onDragStart,
  onDragEnd,
}: UseDragAndDropProps = {}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-draggable="true"]') || target.closest(".drag-handle")) {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
        onDragStart?.();
      }
    },
    [position.x, position.y, onDragStart]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-draggable="true"]') || target.closest(".drag-handle")) {
        e.preventDefault();
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        });
        onDragStart?.();
      }
    },
    [position.x, position.y, onDragStart]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxWidth = Math.min(400, viewportWidth * 0.9);
        const maxHeight = Math.min(200, viewportHeight * 0.8);

        // Constrain position to viewport
        const constrainedX = Math.max(0, Math.min(newX, viewportWidth - maxWidth));
        const constrainedY = Math.max(0, Math.min(newY, viewportHeight - maxHeight));

        setPosition({
          x: constrainedX,
          y: constrainedY,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const newX = touch.clientX - dragStart.x;
        const newY = touch.clientY - dragStart.y;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxWidth = Math.min(400, viewportWidth * 0.9);
        const maxHeight = Math.min(200, viewportHeight * 0.8);

        // Constrain position to viewport
        const constrainedX = Math.max(0, Math.min(newX, viewportWidth - maxWidth));
        const constrainedY = Math.max(0, Math.min(newY, viewportHeight - maxHeight));

        setPosition({
          x: constrainedX,
          y: constrainedY,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    onDragEnd?.();
  }, [onDragEnd]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    onDragEnd?.();
  }, [onDragEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return {
    isDragging,
    position,
    setPosition,
    handleMouseDown,
    handleTouchStart,
  };
};
