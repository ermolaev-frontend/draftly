import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { TouchEvent, MouseEvent } from 'react';
import { CanvasEditor } from './CanvasEditor';
import styles from './CanvasEditorWrapper.module.scss';

export const CanvasEditorWrapper = forwardRef<CanvasEditor | null, unknown>(
  (_, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const editorRef = useRef<CanvasEditor | null>(null);

    useEffect(() => {
      if (canvasRef.current && !editorRef.current) {
        editorRef.current = new CanvasEditor(canvasRef.current);
      }
    }, []);

    useImperativeHandle(ref, () => editorRef.current as CanvasEditor, []);

    // --- Event Handlers ---
    const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
      editorRef.current?.onMouseDown(e.nativeEvent);
    };
    const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
      editorRef.current?.onMouseMove(e.nativeEvent);
    };
    const handleMouseUp = () => {
      editorRef.current?.onMouseUp();
    };
    const handleMouseLeave = () => {
      editorRef.current?.onMouseUp();
    };

    const adaptTouchEvent = (e: TouchEvent<HTMLCanvasElement>): { offsetX: number; offsetY: number } => {
      const touch = e.touches[0] || e.changedTouches[0];
      const bounding = canvasRef.current?.getBoundingClientRect();
      const offsetX = bounding && touch ? touch.clientX - bounding.left : 0;
      const offsetY = bounding && touch ? touch.clientY - bounding.top : 0;
      return { offsetX, offsetY };
    };

    const handleTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      editorRef.current?.onMouseDown(adaptTouchEvent(e));
    };
    const handleTouchMove = (e: TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      editorRef.current?.onMouseMove(adaptTouchEvent(e));
    };
    const handleTouchEnd = (e: TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      editorRef.current?.onMouseUp();
    };
    const handleTouchCancel = (e: TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      editorRef.current?.onMouseUp();
    };

    return (
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        />
      </div>
    );
  }
); 