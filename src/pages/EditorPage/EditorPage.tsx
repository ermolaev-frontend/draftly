import React, { useRef, useEffect, useState } from 'react';
import { CanvasEditorWrapper } from '../../entities/canvas/CanvasEditorWrapper';
import styles from './EditorPage.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare as faSquareRegular, faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import { faSlash, faArrowPointer, faPencil, faRotateLeft, faBroom } from '@fortawesome/free-solid-svg-icons';
import { Toolbar } from '../../widgets/Toolbar/Toolbar';

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