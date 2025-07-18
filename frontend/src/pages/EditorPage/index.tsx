import React from 'react';
import { DraftlyWrapper } from 'entities/canvas/CanvasWrapper';
import { Toolbar } from 'widgets/Toolbar/Toolbar';

import { useEditorPage } from './useEditorPage';
import styles from './style.module.scss';

export const EditorPage: React.FC = () => {
  const {
    tool,
    isDarkMode,
    color,
    draftlyRef,
    handleTool,
    handleToggleDarkMode,
    handleEmptyShapes,
    handleColorChange,
    handleShapesUpdate,
  } = useEditorPage();

  return (
    <div className={styles.editorPage} data-theme={isDarkMode ? 'dark' : 'light'}>
      <Toolbar
        activeTool={tool}
        onToolChange={handleTool}
        onClearCanvas={handleEmptyShapes}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        selectedColor={color}
        onColorChange={handleColorChange}
      />
      <DraftlyWrapper
        ref={draftlyRef}
        onShapesUpdate={handleShapesUpdate}
      />
    </div>
  );
};
export default EditorPage; 
