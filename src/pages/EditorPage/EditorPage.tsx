import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasEditorWrapper } from '../../entities/canvas/CanvasEditorWrapper';
import styles from './EditorPage.module.scss';
import { Toolbar } from '../../widgets/Toolbar/Toolbar';

export const EditorPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState('select');
  const editorRef = useRef<any>(null);

  // Handler to set tool
  const handleTool = useCallback((tool: string) => {
    setActiveTool(tool);
    if (editorRef.current) {
      editorRef.current.setTool(tool);
    }
  }, [editorRef]);

  // Handler to clear canvas
  const handleClear = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.clearCanvas();
    }
  }, [editorRef]);

  // Handler to restore shapes
  const handleRestore = useCallback(() => {
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
  }, [editorRef]);

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
      <CanvasEditorWrapper ref={editorRef} />
    </div>
  );
};

export default EditorPage; 