import { useRef, useImperativeHandle, useCallback, type PointerEvent } from 'react';

import type { EventOffset } from 'shared/types/canvas';

import { Draftly } from '../classes/Draftly';

export const useCanvasWrapper = (ref: React.Ref<Draftly>, onShapesUpdate?: () => void) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const draftlyRef = useRef<Draftly | null>(null);

  const setCanvasRef = useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    if (node && !draftlyRef.current) {
      draftlyRef.current = new Draftly(node);
    }
  }, []);

  const getPointerOffset = (e: PointerEvent<HTMLCanvasElement>): EventOffset => {
    const bounding = canvasRef.current?.getBoundingClientRect();
    return {
      offsetX: e.clientX - (bounding?.left ?? 0),
      offsetY: e.clientY - (bounding?.top ?? 0),
    };
  };

  const handlePointerDown = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    draftlyRef.current?.handlePointerDown(getPointerOffset(e));
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    draftlyRef.current?.handlePointerMove(getPointerOffset(e));
  }, []);

  const handlePointerEnd = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    draftlyRef.current?.handlePointerUp();
    (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);
    
    // Вызываем callback для отправки обновленных shapes
    onShapesUpdate?.();
  }, [onShapesUpdate]);

  useImperativeHandle(ref, () => draftlyRef.current as Draftly, []);

  return {
    setCanvasRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp: handlePointerEnd,
    handlePointerCancel: handlePointerEnd,
  };
}; 
