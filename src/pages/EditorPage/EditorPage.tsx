import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasEditorWrapper } from '../../entities/canvas/CanvasEditorWrapper';
import styles from './EditorPage.module.scss';
import { Toolbar } from '../../widgets/Toolbar/Toolbar';
import type { ToolType } from '../../shared/types/canvas';

export const EditorPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const editorRef = useRef<import('../../entities/canvas/CanvasEditor').CanvasEditor | null>(null);

  // Handler to set tool
  const handleTool = useCallback((tool: ToolType) => {
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
          editorRef.current.redraw();
        } catch (e) {
          alert('Error restoring shapes!');
        }
      } else {
        alert('No saved shapes to restore.');
      }
    }
  }, [editorRef]);

  // Listen for Escape key to select the Selection tool and Delete/Backspace to delete selected shape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveTool('select');
        editorRef.current?.setTool('select');
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        editorRef.current?.deleteSelectedShape?.();
        return;
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