import { useEffect, useRef, useCallback, useState } from 'react';
import { Rectangle } from 'entities/canvas/classes/Rectangle';
import { Circle } from 'entities/canvas/classes/Circle';
import { Line } from 'entities/canvas/classes/Line';
import { Pencil } from 'entities/canvas/classes/Pencil';

import type { IShape, IShapeFields } from 'shared/types/canvas';

interface WebSocketMessage {
  type: string;
  roomId?: string;
  count?: number;
  timestamp: string;
  data?: IShapeFields[];
  message?: string;
  error?: string;
}

interface UseWebSocketOptions {
  roomId: string;
  onShapesReceived?: (shapes: IShape[]) => void;
}

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

export const useWebSocket = ({
  roomId,
  onShapesReceived,
}: UseWebSocketOptions) => {
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
    const ws = new WebSocket('ws://localhost:3002');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = event => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        switch (data.type) {
          case 'broadcast':
            if (data.data && onShapesReceived) {
              console.log(`Received shapes from another client: ${data.count} objects`);
              try {
                const shapes = createShapesFromData(data.data);
                onShapesReceived(shapes);
              } catch (error) {
                console.error('Error creating shapes:', error);
              }
            }
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
  }, [onShapesReceived]);

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

  // Automatic connection
  useEffect(() => {
    connect();
    
    return disconnect;
  }, [connect, disconnect]);

  // Присоединение к комнате после подключения
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
    connect,
    disconnect,
  };
}; 
