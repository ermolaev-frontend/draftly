import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasEditorWrapper } from 'entities/canvas/CanvasEditorWrapper';
import styles from './EditorPage.module.scss';
import { Toolbar } from 'widgets/Toolbar/Toolbar';
import type { ToolType } from 'shared/types/canvas';
import { CanvasEditor } from 'entities/canvas/CanvasEditor';

export const EditorPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const getSystemTheme = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDarkMode, setIsDarkMode] = useState(getSystemTheme());
  const editorRef = useRef<CanvasEditor | null>(null);

  // Handler to set tool
  const handleTool = useCallback((tool: ToolType) => {
    setActiveTool(tool);
    if (editorRef.current) {
      editorRef.current.setTool(tool);
    }
  }, [editorRef]);

  // Toggle dark mode
  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  useEffect(() => {
    function handleResize() {
      editorRef.current?.resizeCanvasToWrapper();
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  useEffect(() => {
    // Listen for system theme changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={styles.editorPage} data-theme={isDarkMode ? 'dark' : 'light'}>
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleTool}
        onClearCanvas={() => editorRef.current?.clearCanvas()}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
      <CanvasEditorWrapper ref={editorRef} />
    </div>
  );
};

export default EditorPage; 