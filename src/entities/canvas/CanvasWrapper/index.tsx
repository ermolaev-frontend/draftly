import { useRef, forwardRef, useImperativeHandle, useCallback, useEffect } from 'react';

import type { EventOffset } from 'shared/types/canvas';

import { Draftly } from '../classes/Draftly';
import styles from './style.module.scss';

interface DraftlyWrapperProps {
  selectedColor: string;
}

export const DraftlyWrapper = forwardRef<Draftly | null, DraftlyWrapperProps>(
  ({ selectedColor }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const draftlyRef = useRef<Draftly | null>(null);

    const setCanvasRef = useCallback((node: HTMLCanvasElement | null) => {
      canvasRef.current = node;

      if (node && !draftlyRef.current) {
        draftlyRef.current = new Draftly(node);
      }
    }, []);

    useEffect(() => {
      if (draftlyRef.current) {
        draftlyRef.current.setColor(selectedColor);
      }
    }, [selectedColor]);

    const getPointerOffset = (e: React.PointerEvent<HTMLCanvasElement>): EventOffset => {
      const bounding = canvasRef.current?.getBoundingClientRect();
      
      return {
        offsetX: e.clientX - (bounding?.left ?? 0),
        offsetY: e.clientY - (bounding?.top ?? 0),
      };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      draftlyRef.current?.handlePointerDown(getPointerOffset(e));
      (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      draftlyRef.current?.handlePointerMove(getPointerOffset(e));
    };

    const handlePointerEnd = (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      draftlyRef.current?.handlePointerUp();
      (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);
    };

    const handlePointerUp = handlePointerEnd;
    const handlePointerCancel = handlePointerEnd;

    useImperativeHandle(ref, () => draftlyRef.current as Draftly, []);

    return (
      <div className={styles.canvasWrapper}>
        <canvas
          ref={setCanvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        />
      </div>
    );
  },
); 
