import { useEffect, useRef, useCallback, useState } from 'react';
import { Rectangle } from 'entities/canvas/classes/Rectangle';
import { Circle } from 'entities/canvas/classes/Circle';
import { Line } from 'entities/canvas/classes/Line';
import { Pencil } from 'entities/canvas/classes/Pencil';

import type { IShape, IShapeFields } from 'shared/types/canvas';

interface Props {
  roomId: string;
  onShapesReceived: (shapes: IShape[]) => void;
  onShapeAdded?: (shape: IShape) => void;
  onShapeUpdated?: (shape: IShape) => void;
  onShapeDeleted?: (shapeId: string) => void;
  onEmptyShapes?: () => void;
}

// WebSocket server configuration
const WS_SERVER_URL = import.meta.env.VITE_WS_SERVER_URL ?? 'ws://localhost:3002';

// Function to create shapes from data
const createShapesFromData = (data: IShapeFields[]): IShape[] => {
  return data.map((shapeData: IShapeFields) => {
    switch (shapeData.type) {
      case 'rectangle':
        return new Rectangle(shapeData as Partial<Rectangle>);
      case 'circle':
        return new Circle(shapeData as Partial<Circle>);
      case 'line':
        return new Line(shapeData as Partial<Line>);
      case 'pencil':
        return new Pencil(shapeData as Partial<Pencil>);
      default:
        throw new Error(`Unknown shape type: ${shapeData.type}`);      
    }
  });
};

export const useWebSocket = (props: Props) => {
  const { roomId, onShapesReceived, onShapeAdded, onShapeUpdated, onShapeDeleted, onEmptyShapes } = props;
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    console.log('Attempting to connect to WebSocket...');
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected or connection in progress');
      return;
    }

    console.log('Creating new WebSocket connection...');
    const ws = new WebSocket(WS_SERVER_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = event => {
      try {
        const data: any = JSON.parse(event.data);
        switch (data.type) {
          case 'broadcast':
            if (data.data) {
              const shapes = createShapesFromData(data.data);
              onShapesReceived(shapes);
            }
            break;
          case 'add_shape':
            if (data.shape && onShapeAdded) {
              onShapeAdded(createShapesFromData([data.shape])[0]);
            }
            break;
          case 'update_shape':
            if (data.shape && onShapeUpdated) {
              onShapeUpdated(createShapesFromData([data.shape])[0]);
            }
            break;
          case 'delete_shape':
            if (data.shapeId && onShapeDeleted) {
              onShapeDeleted(data.shapeId);
            }
            break;
          case 'empty_shapes':
            if (onEmptyShapes) onEmptyShapes();
            break;
          case 'error':
            setError(data.message ?? 'Unknown error');
            console.error('WebSocket error:', data.message);
            break;
          default:
            console.log('Unknown message:', data);
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };

    ws.onclose = event => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      setIsConnected(false);
      setCurrentRoom(null);
    };

    ws.onerror = error => {
      console.error('WebSocket connection error:', error);
      setError('Connection error to server');
      setIsConnected(false);
    };
  }, [onShapesReceived, onShapeAdded, onShapeUpdated, onShapeDeleted, onEmptyShapes]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendShapes = useCallback((shapes: IShape[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && currentRoom) {
      wsRef.current.send(JSON.stringify(shapes));
      console.log(`Sending ${shapes.length} shapes to room ${currentRoom}`);
    } else {
      console.warn('WebSocket not connected or not in room');
    }
  }, [currentRoom]);

  const sendAddShape = useCallback((shape: IShape) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && currentRoom) {
      wsRef.current.send(JSON.stringify({ type: 'add_shape', shape }));
    }
  }, [currentRoom]);

  const sendUpdateShape = useCallback((shape: IShape) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && currentRoom) {
      wsRef.current.send(JSON.stringify({ type: 'update_shape', shape }));
    }
  }, [currentRoom]);

  const sendDeleteShape = useCallback((shapeId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && currentRoom) {
      wsRef.current.send(JSON.stringify({ type: 'delete_shape', shapeId }));
    }
  }, [currentRoom]);

  const sendEmptyShapes = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && currentRoom) {
      wsRef.current.send(JSON.stringify({ type: 'empty_shapes' }));
    }
  }, [currentRoom]);

  // Automatic connection
  useEffect(() => {
    connect();
    
    return disconnect;
  }, [connect, disconnect]);

  // Join room after connection
  useEffect(() => {
    if (isConnected && roomId && !currentRoom) {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'join_room',
          roomId,
        }));
        setCurrentRoom(roomId);
      }
    }
  }, [isConnected, roomId, currentRoom]);

  return {
    isConnected,
    currentRoom,
    error,
    sendShapes,
    sendAddShape,
    sendUpdateShape,
    sendDeleteShape,
    sendEmptyShapes,
    connect,
    disconnect,
  };
}; 
