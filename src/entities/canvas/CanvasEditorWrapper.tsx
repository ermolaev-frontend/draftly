import { useEffect, useRef, forwardRef, useImperativeHandle, MouseEvent } from 'react';
import { CanvasEditor } from './CanvasEditor';
import styles from './CanvasEditorWrapper.module.scss';

export const CanvasEditorWrapper = forwardRef<any, unknown>(
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

    return (
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    );
  }
); 