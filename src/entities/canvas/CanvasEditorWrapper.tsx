import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { CanvasEditor } from './CanvasEditor';
import styles from './CanvasEditorWrapper.module.scss';
import type { Shape } from '../../shared/types/canvas';
import { generateInitialShapes } from '../../shared/lib/canvas/generateInitialShapes';

interface CanvasEditorWrapperProps {
  shapes: Shape[];
  actions: {
    onAddShape: (shape: Shape) => void;
    onUpdateShape: (id: string, shape: Shape) => void;
    onRemoveShape: (id: string) => void;
    onClearShapes: () => void;
  };
  onInitShapes?: (shapes: Shape[]) => void;
}

export const CanvasEditorWrapper = forwardRef<any, CanvasEditorWrapperProps>(
  ({ shapes, actions, onInitShapes }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const editorRef = useRef<CanvasEditor | null>(null);
    const hasInitShapes = useRef(false);

    // Detect wrapper size and generate initial shapes once on mount
    useEffect(() => {
      if (!hasInitShapes.current && onInitShapes && canvasRef.current) {
        const wrapper = canvasRef.current.parentElement;
        if (wrapper) {
          const rect = wrapper.getBoundingClientRect();
          const width = rect.width;
          const height = rect.height;
          const initialShapes = generateInitialShapes(width, height);
          onInitShapes(initialShapes);
          hasInitShapes.current = true;
        }
      }
    }, [onInitShapes]);

    // Create the CanvasEditor instance only once
    useEffect(() => {
      if (canvasRef.current && !editorRef.current) {
        editorRef.current = new CanvasEditor(canvasRef.current.id, shapes, actions);
      }
    }, []);

    // Update shapes and redraw when shapes change
    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.setShapes(shapes);
      }
    }, [shapes]);

    useImperativeHandle(ref, () => editorRef.current as CanvasEditor, []);

    return (
      <div className={styles.canvasWrapper}>
        <canvas id="canvas" ref={canvasRef} />
      </div>
    );
  }
); 