import React, { useRef, useState, useEffect } from 'react';
import { CanvasEditorWrapper } from '../../entities/canvas/CanvasEditorWrapper';
import styles from './EditorPage.module.scss';
import { Toolbar } from '../../widgets/Toolbar/Toolbar';
import { useShapesStore } from '../../features/shapesSlice';
import type { Shape } from '../../shared/types/canvas';

export const EditorPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState('select');
  const editorRef = useRef<any>(null);
  const shapes = useShapesStore((state) => state.shapes);
  const setShapes = useShapesStore((state) => state.setShapes);
  const addShape = useShapesStore((state) => state.addShape);
  const updateShape = useShapesStore((state) => state.updateShape);
  const removeShape = useShapesStore((state) => state.removeShape);
  const clearShapes = useShapesStore((state) => state.clearShapes);

  const actions = {
    onAddShape: (shape: Shape) => addShape(shape),
    onUpdateShape: (id: string, shape: Shape) => updateShape(id, shape),
    onRemoveShape: (id: string) => removeShape(id),
    onClearShapes: () => clearShapes(),
  };

  // Handler to set tool
  const handleTool = (tool: string) => {
    setActiveTool(tool);
    if (editorRef.current) {
      editorRef.current.setTool(tool);
    }
  };

  // Handler to clear canvas
  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.clearCanvas();
    }
  };

  // Handler to restore shapes
  const handleRestore = () => {
    const data = localStorage.getItem('shapes-storage');
    if (data) {
      try {
        const state = JSON.parse(data);
        if (state && state.state && Array.isArray(state.state.shapes)) {
          setShapes(state.state.shapes);
          if (editorRef.current) {
            editorRef.current.shapes = state.state.shapes;
            editorRef.current.redraw();
          }
        }
      } catch (e) {
        alert('Ошибка восстановления фигур!');
      }
    } else {
      alert('Нет сохранённых фигур для восстановления.');
    }
  };

  // Listen for Escape key to select the Selection tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveTool('select');
        if (editorRef.current) {
          editorRef.current.setTool('select');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={styles.editorPage}>
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleTool}
        onClear={handleClear}
        onRestore={handleRestore}
      />
      <CanvasEditorWrapper
        ref={editorRef}
        shapes={shapes}
        actions={actions}
        onInitShapes={(shapes) => setShapes(shapes)}
      />
    </div>
  );
};

export default EditorPage; 