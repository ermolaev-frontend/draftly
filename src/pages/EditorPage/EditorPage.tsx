import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DraftlyWrapper } from 'entities/canvas/CanvasWrapper';
import { Draftly } from 'entities/canvas/classes/Draftly';
import { Toolbar } from 'widgets/Toolbar/Toolbar';

import type { ToolType } from 'shared/types/canvas';

import styles from './EditorPage.module.scss';

const getSystemTheme = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const EditorPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeColor, setActiveColor] = useState('#ff6b6b');
  const [isDarkMode, setIsDarkMode] = useState(getSystemTheme());
  const draftlyRef = useRef<Draftly | null>(null);

  // Handler to set tool
  const handleTool = useCallback((tool: ToolType) => {
    setActiveTool(tool);
    
    if (draftlyRef.current) {
      draftlyRef.current.setTool(tool);
    }
  }, []);

  // Handler to set color
  const handleColorChange = useCallback((color: string) => {
    setActiveColor(color);
    
    if (editorRef.current) {
      editorRef.current.setActiveColor(color);
    }
  }, []);

  // Toggle dark mode
  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleClearCanvas = useCallback(() => {
    draftlyRef.current?.clearCanvas();
  }, []);

  useEffect(() => {
    function handleResize() {
      draftlyRef.current?.resizeCanvasToWrapper();
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
          draftlyRef.current?.setTool('select');
          draftlyRef.current?.deselectShape();

          return;
        case 'Delete':
        case 'Backspace':
          draftlyRef.current?.deleteSelectedShape?.();

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
        activeColor={activeColor}
        onColorChange={handleColorChange}
        onClearCanvas={handleClearCanvas}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
      <DraftlyWrapper ref={draftlyRef} />
    </div>
  );
};

export default EditorPage; 
