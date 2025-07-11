import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DraftlyWrapper } from 'entities/canvas/CanvasWrapper';
import { Draftly } from 'entities/canvas/classes/Draftly';
import { Toolbar } from 'widgets/Toolbar/Toolbar';
import { BASE_PALETTE, TOOLS } from 'shared/types/colors';

import type { ToolType } from 'shared/types/canvas';

import styles from './style.module.scss';

const getSystemTheme = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const EditorPage: React.FC = () => {
  const [tool, setTool] = useState<ToolType>(TOOLS[4]);
  const [isDarkMode, setIsDarkMode] = useState(getSystemTheme());
  const [color, setColor] = useState<string>(BASE_PALETTE[0]);
  const draftlyRef = useRef<Draftly>(null);
  
  const handleTool = useCallback((tool: ToolType) => {
    setTool(tool);
    draftlyRef.current?.setTool(tool);
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleClearCanvas = useCallback(() => {
    draftlyRef.current?.clearCanvas();
  }, []);

  const handleColorChange = useCallback((color: string) => {
    setColor(color);
    draftlyRef.current?.setColor(color);

    if (tool === TOOLS[0]) {
      setTool(TOOLS[4]);
      draftlyRef.current?.setTool(TOOLS[4]);
      draftlyRef.current?.deselectShape();
    }
  }, [tool]);

  useEffect(() => {
    const handleResize = () => {
      draftlyRef.current?.resizeCanvasToWrapper();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setTool(TOOLS[0]);
          draftlyRef.current?.setTool(TOOLS[0]);
          draftlyRef.current?.deselectShape();

          return;
        case 'Delete':
        case 'Backspace':
          draftlyRef.current?.deleteSelectedShape();

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
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mq.addEventListener('change', handleChange);

    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    draftlyRef.current?.setColor(color);
  }, [color]);

  return (
    <div className={styles.editorPage} data-theme={isDarkMode ? 'dark' : 'light'}>
      <Toolbar
        activeTool={tool}
        onToolChange={handleTool}
        onClearCanvas={handleClearCanvas}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        selectedColor={color}
        onColorChange={handleColorChange}
      />
      <DraftlyWrapper ref={draftlyRef} />
    </div>
  );
};

export default EditorPage; 
