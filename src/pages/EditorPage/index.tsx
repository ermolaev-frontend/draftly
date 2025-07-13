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
    isConnected,
    currentRoom,
    clientsInRoom,
    wsError,
    roomId,
    setRoomId,
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
        isConnected={isConnected}
        currentRoom={currentRoom}
        clientsInRoom={clientsInRoom}
        roomId={roomId}
        onRoomChange={setRoomId}
      />
      <DraftlyWrapper ref={draftlyRef} onShapesUpdate={handleShapesUpdate} />
    </div>
  );
};
export default EditorPage; 

