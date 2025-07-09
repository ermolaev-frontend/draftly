import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasEditorWrapper } from 'entities/canvas/CanvasWrapper';
import { CanvasEditor } from 'entities/canvas/classes/CanvasEditor';
import { Toolbar } from 'widgets/Toolbar/Toolbar';
import ZoomPanel from 'widgets/ZoomPanel/ZoomPanel';

import type { ToolType } from 'shared/types/canvas';

import styles from './EditorPage.module.scss';

const getSystemTheme = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const EditorPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [isDarkMode, setIsDarkMode] = useState(getSystemTheme());
  const [zoom, setZoom] = useState(1);
  const editorRef = useRef<CanvasEditor | null>(null);

  // Handler to set tool
  const handleTool = useCallback((tool: ToolType) => {
    setActiveTool(tool);
    
    if (editorRef.current) {
      editorRef.current.setTool(tool);
    }
  }, []);

  // Toggle dark mode
  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleClearCanvas = useCallback(() => {
    editorRef.current?.clearCanvas();
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

  // Синхронизация zoom state с CanvasEditor
  useEffect(() => {
    const interval = setInterval(() => {
      if (editorRef.current) {
        setZoom(editorRef.current.viewport?.zoom ?? 1);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleZoomChange = (newZoom: number) => {
    editorRef.current?.setZoom(newZoom);
    setZoom(newZoom);
  };

  return (
    <div className={styles.editorPage} data-theme={isDarkMode ? 'dark' : 'light'}>
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleTool}
        onClearCanvas={handleClearCanvas}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
      <CanvasEditorWrapper ref={editorRef} />
      <ZoomPanel zoom={zoom} minZoom={0.1} maxZoom={5} onZoomChange={handleZoomChange} />
    </div>
  );
};

export default EditorPage; 
