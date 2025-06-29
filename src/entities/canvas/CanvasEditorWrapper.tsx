import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { CanvasEditor } from './CanvasEditor';
import styles from './CanvasEditorWrapper.module.scss';

export const CanvasEditorWrapper = forwardRef<any, unknown>(
  (_, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const editorRef = useRef<CanvasEditor | null>(null);

    useEffect(() => {
      if (canvasRef.current && !editorRef.current) {
        editorRef.current = new CanvasEditor(canvasRef.current.id);
      }
    }, []);

    useImperativeHandle(ref, () => editorRef.current as CanvasEditor, []);

    return (
      <div className={styles.canvasWrapper}>
        <canvas id="canvas" ref={canvasRef} />
      </div>
    );
  }
); 