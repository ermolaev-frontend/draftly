import React, { useRef, useState } from 'react';
import { CanvasEditorWrapper } from '../../entities/canvas/CanvasEditorWrapper';
import styles from './EditorPage.module.scss';
import { Toolbar } from '../../widgets/Toolbar/Toolbar';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../app/store';
import { addShape, updateShape, removeShape, clearShapes, setShapes } from '../../features/shapesSlice';
import type { Shape } from '../../shared/types/canvas';

export const EditorPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState('select');
  const editorRef = useRef<any>(null);
  const shapes = useSelector((state: RootState) => state.shapes.shapes);
  const dispatch = useDispatch();

  const actions = {
    onAddShape: (shape: Shape) => dispatch(addShape(shape)),
    onUpdateShape: (id: string, shape: Shape) => dispatch(updateShape({ id, shape })),
    onRemoveShape: (id: string) => dispatch(removeShape(id)),
    onClearShapes: () => dispatch(clearShapes()),
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
    if (editorRef.current) {
      const data = localStorage.getItem('shapes');
      if (data) {
        try {
          const shapes = JSON.parse(data);
          editorRef.current.shapes = shapes;
          editorRef.current.redraw();
        } catch (e) {
          alert('Ошибка восстановления фигур!');
        }
      } else {
        alert('Нет сохранённых фигур для восстановления.');
      }
    }
  };

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
        onInitShapes={(shapes) => dispatch(setShapes(shapes))}
      />
    </div>
  );
};

export default EditorPage; 