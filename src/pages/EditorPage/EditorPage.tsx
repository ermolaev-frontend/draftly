import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasEditorWrapper } from '../../entities/canvas/CanvasEditorWrapper';
import styles from './EditorPage.module.scss';
import { Toolbar } from '../../widgets/Toolbar/Toolbar';

// --- Custom hook for WebSocket shape sync ---
function useShapeSync(editorRef: React.RefObject<any>) {
  const wsRef = useRef<WebSocket | null>(null);
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    const ws = new window.WebSocket('ws://localhost:8080');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (['init', 'set_shapes'].includes(data.type) && Array.isArray(data.shapes)) {
          isRemoteUpdate.current = true;
          editorRef.current?.setShapes(data.shapes);
        } else if (data.type === 'add_shape' && data.shape) {
          const shapes = editorRef.current?.getShapes() || [];
          isRemoteUpdate.current = true;
          editorRef.current?.setShapes([...shapes, data.shape]);
        } else if (data.type === 'clear_shapes') {
          isRemoteUpdate.current = true;
          editorRef.current?.setShapes([]);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('WS message error', e);
      }
    };
    ws.onerror = (err) => {
      // eslint-disable-next-line no-console
      console.error('WebSocket error', err);
    };
    return () => {
      ws.close();
    };
  }, [editorRef]);

  // Send shapes to server after drawing/moving/resizing is finished
  useEffect(() => {
    const sendShapes = () => {
      if (!editorRef.current) return;
      if (!isRemoteUpdate.current) {
        const shapes = editorRef.current.getShapes();
        wsRef.current?.send(JSON.stringify({ type: 'set_shapes', shapes }));
      } else {
        isRemoteUpdate.current = false;
      }
    };
    window.addEventListener('mouseup', sendShapes);
    return () => {
      window.removeEventListener('mouseup', sendShapes);
    };
  }, [editorRef]);

  // Helper to send a new shape
  const sendNewShape = useCallback(() => {
    if (!editorRef.current) return;
    const shapes = editorRef.current.getShapes();
    const shape = shapes[shapes.length - 1];
    wsRef.current?.send(JSON.stringify({ type: 'add_shape', shape }));
  }, [editorRef]);

  // Helper to send clear
  const sendClear = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: 'clear_shapes' }));
  }, []);

  // Helper to send all shapes (for move/resize, etc.)
  const sendSetShapes = useCallback(() => {
    if (!editorRef.current) return;
    const shapes = editorRef.current.getShapes();
    wsRef.current?.send(JSON.stringify({ type: 'set_shapes', shapes }));
  }, [editorRef]);

  return { sendNewShape, sendClear, sendSetShapes };
}

export const EditorPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState('select');
  const editorRef = useRef<any>(null);
  const { sendNewShape, sendClear, sendSetShapes } = useShapeSync(editorRef);

  // Handler to set tool
  const handleTool = useCallback((tool: string) => {
    setActiveTool(tool);
    editorRef.current?.setTool(tool);
  }, []);

  // Handler to clear canvas (and notify server)
  const handleClear = useCallback(() => {
    editorRef.current?.clearCanvas();
    sendClear();
  }, [sendClear]);

  // Handler to restore shapes (local only)
  const handleRestore = useCallback(() => {
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
  }, []);

  // Listen for Escape key to select the Selection tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveTool('select');
        editorRef.current?.setTool('select');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Patch shape-adding methods to send new shape to server
  useEffect(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const shapeMethods = ['addRectangle', 'addCircle', 'addLine', 'addRandomShape'];
    const originals: Record<string, any> = {};
    shapeMethods.forEach((method) => {
      if (editor[method]) {
        originals[method] = editor[method].bind(editor);
        editor[method] = () => {
          originals[method]();
          sendNewShape();
        };
      }
    });
    return () => {
      shapeMethods.forEach((method) => {
        if (originals[method]) editor[method] = originals[method];
      });
    };
  }, [sendNewShape]);

  // --- Real-time shape sharing: send all shape changes ---
  // Remove the global mouseup sync, use onShapesChanged instead
  const handleShapesChanged = useCallback(() => {
    sendSetShapes();
  }, [sendSetShapes]);

  return (
    <div className={styles.editorPage}>
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleTool}
        onClear={handleClear}
        onRestore={handleRestore}
      />
      <CanvasEditorWrapper ref={editorRef} onShapesChanged={handleShapesChanged} />
    </div>
  );
};

export default EditorPage; 