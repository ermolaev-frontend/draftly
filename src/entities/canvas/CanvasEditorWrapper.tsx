import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { CanvasEditor } from './CanvasEditor';
import styles from './CanvasEditorWrapper.module.scss';

interface CanvasEditorWrapperProps {
  width?: number;
  height?: number;
}

export const CanvasEditorWrapper = forwardRef<any, CanvasEditorWrapperProps>(
  ({ width = 800, height = 600 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const editorRef = useRef<CanvasEditor | null>(null);

    useEffect(() => {
      if (canvasRef.current && !editorRef.current) {
        editorRef.current = new CanvasEditor(canvasRef.current.id);
      }
    }, []);

    useImperativeHandle(ref, () => editorRef.current as CanvasEditor, []);

    return (
      <div className={styles.canvasWrapper} style={{ width, height }}>
        <canvas id="canvas" ref={canvasRef} width={width} height={height} />
      </div>
    );
  }
); 