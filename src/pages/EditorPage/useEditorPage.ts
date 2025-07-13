import { useRef, useState, useEffect, useCallback } from 'react';

import { Draftly } from 'entities/canvas/classes/Draftly';
import { BASE_PALETTE, TOOLS } from 'shared/types/colors';
import { useWebSocket } from 'shared/hooks/useWebSocket';

import type { ToolType, IShape } from 'shared/types/canvas';

const getSystemTheme = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const useEditorPage = () => {
  const [tool, setTool] = useState<ToolType>(TOOLS[4]);
  const [isDarkMode, setIsDarkMode] = useState(getSystemTheme());
  const [color, setColor] = useState<string>(BASE_PALETTE[0]);
  const [roomId, setRoomId] = useState<string>('room1');
  const draftlyRef = useRef<Draftly>(null);

  // WebSocket интеграция
  const handleShapesReceived = useCallback((shapes: IShape[]) => {
    if (draftlyRef.current) {
      draftlyRef.current.setShapes(shapes);
    }
  }, []);

  const handleClientJoined = useCallback((roomId: string, clientsInRoom: number) => {
    console.log(`Клиент присоединился к комнате ${roomId}: ${clientsInRoom} клиентов`);
  }, []);

  const handleClientLeft = useCallback((roomId: string, clientsInRoom: number) => {
    console.log(`Клиент покинул комнату ${roomId}: ${clientsInRoom} клиентов`);
  }, []);

  const handleClientDisconnected = useCallback((roomId: string, clientsInRoom: number) => {
    console.log(`Клиент отключился из комнаты ${roomId}: ${clientsInRoom} клиентов`);
  }, []);

  const {
    isConnected,
    currentRoom,
    clientsInRoom,
    error: wsError,
    sendShapes,
    requestShapes,
  } = useWebSocket({
    roomId,
    onShapesReceived: handleShapesReceived,
    onClientJoined: handleClientJoined,
    onClientLeft: handleClientLeft,
    onClientDisconnected: handleClientDisconnected,
  });
  
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

  // Отправка shapes через WebSocket
  const handleShapesUpdate = useCallback(() => {
    if (draftlyRef.current && isConnected) {
      const shapes = draftlyRef.current.getShapes();
      sendShapes(shapes);
    }
  }, [isConnected, sendShapes]);

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

  // Запрос фигур при подключении к комнате
  useEffect(() => {
    if (isConnected && currentRoom && draftlyRef.current) {
      // Небольшая задержка для стабильности
      const timer = setTimeout(() => {
        requestShapes();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, currentRoom, requestShapes]);

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
    clientsInRoom,
    wsError,
    roomId,
    setRoomId,
    handleTool,
    handleToggleDarkMode,
    handleClearCanvas,
    handleColorChange,
    handleShapesUpdate,
  };
}; 
