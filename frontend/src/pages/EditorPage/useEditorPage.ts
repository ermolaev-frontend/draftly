import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Draftly } from 'entities/canvas/classes/Draftly';
import { BASE_PALETTE, TOOLS } from 'shared/types/colors';
import { useWebSocket } from 'shared/hooks/useWebSocket';
import { throttle } from 'shared/utils/throttle';

import type { ToolType, IShape } from 'shared/types/canvas';

const getSystemTheme = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Default room configuration
const DEFAULT_ROOM_ID = import.meta.env.VITE_DEFAULT_ROOM_ID ?? 'room1';

export const useEditorPage = () => {
  const [tool, setTool] = useState<ToolType>(TOOLS[4]);
  const [isDarkMode, setIsDarkMode] = useState(getSystemTheme());
  const [color, setColor] = useState<string>(BASE_PALETTE[0]);
  const [roomId, setRoomId] = useState<string>(DEFAULT_ROOM_ID);
  const draftlyRef = useRef<Draftly>(null);

  // WebSocket integration
  const handleShapesReceived = useCallback((shapes: IShape[]) => {
    draftlyRef.current?.setShapes(shapes);
  }, []);

  const handleShapeAdded = useCallback((shape: IShape) => {
    draftlyRef.current?.applyAddShape(shape);
  }, []);

  const handleShapeUpdated = useCallback((shape: IShape) => {
    draftlyRef.current?.applyUpdateShape(shape);
  }, []);

  const handleShapeDeleted = useCallback((shapeId: string) => {
    draftlyRef.current?.applyDeleteShape(shapeId);
  }, []);

  const handleEmptyShapesReceived = useCallback(() => {
    draftlyRef.current?.clearCanvas();
  }, []);

  const {
    isConnected,
    currentRoom,
    error: wsError,
    sendAddShape,
    sendUpdateShape,
    sendDeleteShape,
    sendEmptyShapes,
  } = useWebSocket({
    roomId,
    onShapesReceived: handleShapesReceived,
    onShapeAdded: handleShapeAdded,
    onShapeUpdated: handleShapeUpdated,
    onShapeDeleted: handleShapeDeleted,
    onEmptyShapes: handleEmptyShapesReceived,
  });
  
  const handleTool = useCallback((tool: ToolType) => {
    setTool(tool);
    draftlyRef.current?.setTool(tool);
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleEmptyShapes = useCallback(() => {
    draftlyRef.current?.clearCanvas();

    if (isConnected) {
      sendEmptyShapes();
    }
  }, [isConnected, sendEmptyShapes]);

  // Throttling for update_shape using useMemo
  const throttledSendUpdateShape = useMemo(() => throttle((shape: IShape) => {
    sendUpdateShape(shape);
  }, 50), [sendUpdateShape]);

  // Sending shapes via WebSocket
  const handleShapesUpdate = useCallback((action?: 'add' | 'update' | 'delete', shape?: IShape, shapeId?: string) => {
    if (!isConnected) return;

    if (action === 'add' && shape) {
      sendAddShape(shape);
    } else if (action === 'update' && shape) {
      throttledSendUpdateShape(shape);
    } else if (action === 'delete' && shapeId) {
      sendDeleteShape(shapeId);
    }
  }, [isConnected, sendAddShape, throttledSendUpdateShape, sendDeleteShape]);

  const handleColorChange = useCallback((color: string) => {
    setColor(color);
    draftlyRef.current?.setColor(color);

    if (tool === TOOLS[0]) {
      handleTool(TOOLS[4]);
      draftlyRef.current?.deselectShape();
    }
  }, [handleTool, tool]);

  // Handle window resize
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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setTool(TOOLS[0]);
          draftlyRef.current?.setTool(TOOLS[0]);
          draftlyRef.current?.deselectShape();

          break;
        
        case 'Delete':
        case 'Backspace': 
          // eslint-disable-next-line no-case-declarations
          const deletedShapeId = draftlyRef.current?.deleteSelectedShape();

          if (deletedShapeId) {
            sendDeleteShape(deletedShapeId);
          }

          break;

        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sendDeleteShape]);

  // Handle system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mq.addEventListener('change', handleChange);

    return () => mq.removeEventListener('change', handleChange);
  }, []);

  return {
    tool,
    isDarkMode,
    color,
    draftlyRef,
    isConnected,
    currentRoom,
    wsError,
    roomId,
    setRoomId,
    handleTool,
    handleToggleDarkMode,
    handleEmptyShapes,
    handleColorChange,
    handleShapesUpdate,
  };
}; 
