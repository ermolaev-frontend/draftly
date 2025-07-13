import React from 'react';
import { DraftlyWrapper } from 'entities/canvas/CanvasWrapper';
import { Toolbar } from 'widgets/Toolbar/Toolbar';

import { useEditorPage } from './useEditorPage';
import styles from './style.module.scss';

const ConnectionStatus: React.FC<{
  isConnected: boolean;
  currentRoom?: string | null;
}> = ({ isConnected, currentRoom }) => (
  <div className={styles.connectionStatusBox}>
    <div className={styles.connectionIndicator + ' ' + (isConnected ? styles.connected : styles.disconnected)}>
      <span className={styles.connectionDot} />
      {isConnected ? 'Подключено' : 'Отключено'}
    </div>
    {currentRoom && (
      <div className={styles.roomInfo}>
        Комната: {currentRoom}
      </div>
    )}
  </div>
);

export const EditorPage: React.FC = () => {
  const {
    tool,
    isDarkMode,
    color,
    draftlyRef,
    isConnected,
    currentRoom,
    handleTool,
    handleToggleDarkMode,
    handleClearCanvas,
    handleColorChange,
    handleShapesUpdate,
  } = useEditorPage();

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
      <DraftlyWrapper
        ref={draftlyRef}
        onShapesUpdate={handleShapesUpdate}
      />
      <ConnectionStatus
        isConnected={isConnected}
        currentRoom={currentRoom}
      />
    </div>
  );
};
export default EditorPage; 
