import { useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import type { TouchEvent, MouseEvent } from 'react';
import { CanvasEditor } from './CanvasEditor';
import styles from './CanvasEditorWrapper.module.scss';

export const CanvasEditorWrapper = forwardRef<CanvasEditor | null, unknown>(
  (_, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const editorRef = useRef<CanvasEditor | null>(null);

    // Create CanvasEditor as soon as canvas is available
    const setCanvasRef = useCallback((node: HTMLCanvasElement | null) => {
      canvasRef.current = node;
      if (node && !editorRef.current) {
        editorRef.current = new CanvasEditor(node);
      }
    }, []);

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
      if (!touch || !canvasRef.current) return { offsetX: 0, offsetY: 0 };
      const bounding = canvasRef.current.getBoundingClientRect();
      const offsetX = touch.clientX - bounding.left;
      const offsetY = touch.clientY - bounding.top;
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

    useImperativeHandle(ref, () => editorRef.current as CanvasEditor, []);


    return (
      <div className={styles.canvasWrapper}>
        <canvas
          ref={setCanvasRef}
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