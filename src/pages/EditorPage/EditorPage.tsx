import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasEditorWrapper } from 'entities/canvas/CanvasEditorWrapper';
import styles from './EditorPage.module.scss';
import { Toolbar } from 'widgets/Toolbar/Toolbar';
import type { ToolType } from 'shared/types/canvas';

export const EditorPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const editorRef = useRef<import('entities/canvas/CanvasEditor').CanvasEditor | null>(null);

  // Handler to set tool
  const handleTool = useCallback((tool: ToolType) => {
    setActiveTool(tool);
    if (editorRef.current) {
      editorRef.current.setTool(tool);
    }
  }, [editorRef]);

  // Listen for Escape key to select the Selection tool and Delete/Backspace to delete selected shape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setActiveTool('select');
          editorRef.current?.setTool('select');
          editorRef.current?.deselectShape();
          editorRef.current?.redraw();
          return;
        case 'Delete':
        case 'Backspace':
          editorRef.current?.deleteSelectedShape?.();
          return;
        default:
          break;
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
      />
      <CanvasEditorWrapper ref={editorRef} />
    </div>
  );
};

export default EditorPage; 