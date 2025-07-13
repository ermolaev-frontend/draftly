import { useEffect, useRef, useCallback, useState } from 'react';

import type { IShape } from '../types/canvas';

import { Rectangle } from '../../entities/canvas/classes/Rectangle';
import { Circle } from '../../entities/canvas/classes/Circle';
import { Line } from '../../entities/canvas/classes/Line';
import { Pencil } from '../../entities/canvas/classes/Pencil';

// Тип для данных фигур, получаемых по сети
type ShapeData = {
  type: string;
  id: string;
  color: string;
  strokeWidth: number;
  [key: string]: unknown;
};

interface WebSocketMessage {
  type: string;
  roomId?: string;
  count?: number;
  timestamp: string;
  data?: ShapeData[];
  message?: string;
  error?: string;
  clientsInRoom?: number;
  availableRooms?: string[];
}

interface UseWebSocketOptions {
  roomId: string;
  onShapesReceived?: (shapes: IShape[]) => void;
  onClientJoined?: (roomId: string, clientsInRoom: number) => void;
  onClientLeft?: (roomId: string, clientsInRoom: number) => void;
  onClientDisconnected?: (roomId: string, clientsInRoom: number) => void;
}

export const useWebSocket = ({
  roomId,
  onShapesReceived,
  onClientJoined,
  onClientLeft,
  onClientDisconnected,
}: UseWebSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [clientsInRoom, setClientsInRoom] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const connectingRef = useRef(false);

  // Функция для создания фигур из данных
  const createShapesFromData = useCallback((data: ShapeData[]): IShape[] => {
    return data.map((shapeData: ShapeData) => {
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
          throw new Error(`Неизвестный тип shape: ${shapeData.type}`);
      }
    });
  }, []);

  const connect = useCallback(() => {
    console.log('Попытка подключения к WebSocket...');
    if (wsRef.current?.readyState === WebSocket.OPEN || connectingRef.current) {
      console.log('WebSocket уже подключен или подключение в процессе');
      return;
    }

    connectingRef.current = true;
    console.log('Создание нового WebSocket соединения...');
    const ws = new WebSocket('ws://localhost:3002');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket подключен успешно');
      setIsConnected(true);
      setError(null);
      connectingRef.current = false;
    };

    ws.onmessage = event => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connection':
            console.log('Подключение установлено:', data.message);
            break;
            
          case 'room_joined':
            setCurrentRoom(data.roomId || null);
            setClientsInRoom(data.clientsInRoom || 0);
            console.log(`Присоединились к комнате: ${data.roomId} (клиентов: ${data.clientsInRoom})`);
            break;
            
          case 'room_left':
            setCurrentRoom(null);
            setClientsInRoom(0);
            console.log('Покинули комнату');
            break;
            
          case 'client_joined':
            setClientsInRoom(data.clientsInRoom || 0);
            onClientJoined?.(data.roomId || '', data.clientsInRoom || 0);
            console.log(`Клиент присоединился к комнате ${data.roomId} (клиентов: ${data.clientsInRoom})`);
            break;
            
          case 'client_left':
            setClientsInRoom(data.clientsInRoom || 0);
            onClientLeft?.(data.roomId || '', data.clientsInRoom || 0);
            console.log(`Клиент покинул комнату ${data.roomId} (клиентов: ${data.clientsInRoom})`);
            break;
            
          case 'client_disconnected':
            setClientsInRoom(data.clientsInRoom || 0);
            onClientDisconnected?.(data.roomId || '', data.clientsInRoom || 0);
            console.log(`Клиент отключился из комнаты ${data.roomId} (клиентов: ${data.clientsInRoom})`);
            break;
            
          case 'broadcast':
            if (data.data && onShapesReceived) {
              console.log(`Получены shapes от другого клиента: ${data.count} объектов`);
              try {
                const shapes = createShapesFromData(data.data);
                onShapesReceived(shapes);
              } catch (error) {
                console.error('Ошибка создания shapes:', error);
              }
            }
            break;
            
          case 'shapes_response':
            if (data.data && onShapesReceived) {
              console.log(`Получены shapes из комнаты: ${data.count} объектов`);
              try {
                const shapes = createShapesFromData(data.data);
                onShapesReceived(shapes);
              } catch (error) {
                console.error('Ошибка создания shapes:', error);
              }
            }
            break;
            
          case 'array_received':
            console.log(`Shapes отправлены успешно: ${data.count} объектов`);
            break;
            
          case 'error':
            setError(data.message || 'Неизвестная ошибка');
            console.error('WebSocket ошибка:', data.message);
            break;
            
          default:
            console.log('Неизвестное сообщение:', data);
        }
      } catch (e) {
        console.error('Ошибка парсинга WebSocket сообщения:', e);
      }
    };

    ws.onclose = event => {
      console.log('WebSocket соединение закрыто:', event.code, event.reason);
      setIsConnected(false);
      setCurrentRoom(null);
      setClientsInRoom(0);
      connectingRef.current = false;
    };

    ws.onerror = error => {
      console.error('WebSocket ошибка подключения:', error);
      setError('Ошибка подключения к серверу');
      setIsConnected(false);
      connectingRef.current = false;
    };
  }, [onShapesReceived, onClientJoined, onClientLeft, onClientDisconnected]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendShapes = useCallback((shapes: IShape[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && currentRoom) {
      wsRef.current.send(JSON.stringify(shapes));
      console.log(`Отправляем ${shapes.length} shapes в комнату ${currentRoom}`);
    } else {
      console.warn('WebSocket не подключен или не в комнате');
    }
  }, [currentRoom]);

  const leaveRoom = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'leave_room',
      }));
    }
  }, []);

  const requestShapes = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && currentRoom) {
      wsRef.current.send(JSON.stringify({
        type: 'request_shapes',
        roomId: currentRoom,
      }));
      console.log(`Запрашиваем shapes из комнаты ${currentRoom}`);
    }
  }, [currentRoom]);

  // Автоматическое подключение
  useEffect(() => {
    const timer = setTimeout(() => {
      connect();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      disconnect();
    };
  }, [connect, disconnect]);

  // Присоединение к комнате после подключения
  useEffect(() => {
    if (isConnected && roomId && !currentRoom) {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'join_room',
          roomId,
        }));
      }
    }
  }, [isConnected, roomId, currentRoom]);

  return {
    isConnected,
    currentRoom,
    clientsInRoom,
    error,
    sendShapes,
    connect,
    disconnect,
    leaveRoom,
    requestShapes,
  };
}; 
