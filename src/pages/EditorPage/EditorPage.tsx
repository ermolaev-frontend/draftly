import React, { useRef, useEffect, useState } from 'react';
import { CanvasEditorWrapper } from '../../entities/canvas/CanvasEditorWrapper';
import styles from './EditorPage.module.scss';

export const EditorPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState('select');
  const editorRef = useRef<any>(null);

  // Handler to set tool
  const handleTool = (tool: string) => {
    setActiveTool(tool);
    if (editorRef.current) {
      editorRef.current.setTool(tool);
    }
  };

  // Handler to clear canvas
  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.clearCanvas();
    }
  };

  // Handler to restore shapes
  const handleRestore = () => {
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
  };

  return (
    <div className={styles.editorPage}>
      <div className={styles.toolbar}>
        <button className={activeTool === 'rectangle' ? styles.active : ''} onClick={() => handleTool('rectangle')}>Rectangle</button>
        <button className={activeTool === 'circle' ? styles.active : ''} onClick={() => handleTool('circle')}>Circle</button>
        <button className={activeTool === 'line' ? styles.active : ''} onClick={() => handleTool('line')}>Line</button>
        <button className={activeTool === 'pencil' ? styles.active : ''} onClick={() => handleTool('pencil')}>Pencil</button>
        <button className={activeTool === 'select' ? styles.active : ''} onClick={() => handleTool('select')}>Select</button>
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleRestore}>Restore</button>
      </div>
      <CanvasEditorWrapper ref={editorRef} />
    </div>
  );
};

export default EditorPage; 