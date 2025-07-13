import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3002;

// Создаем WebSocket сервер
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket сервер запущен на порту ${PORT}`);

// Хранилище для комнат
const rooms = new Map();

// Функция для получения или создания комнаты
function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      clients: new Set(),
      shapes: [] // Храним фигуры для каждой комнаты
    });
  }
  return rooms.get(roomId);
}

// Функция для удаления пустой комнаты
function removeEmptyRoom(roomId) {
  const room = rooms.get(roomId);
  if (room && room.clients.size === 0) {
    rooms.delete(roomId);
    console.log(`Комната ${roomId} удалена (пустая)`);
  }
}

wss.on('connection', (ws) => {
  console.log('Новое подключение установлено');
  
  // Добавляем информацию о клиенте
  ws.clientInfo = {
    roomId: null,
    connectedAt: new Date()
  };
  
  // Отправляем приветственное сообщение
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Подключение установлено',
    timestamp: new Date().toISOString(),
    availableRooms: Array.from(rooms.keys())
  }));

  ws.on('message', (data) => {
    try {
      // Парсим входящее сообщение
      const message = JSON.parse(data);
      
      console.log('Получено сообщение:', message);
      
      // Обработка команд управления комнатами
      if (message.type === 'join_room') {
        const roomId = message.roomId;
        const room = getOrCreateRoom(roomId);
        
        // Удаляем клиента из предыдущей комнаты
        if (ws.clientInfo.roomId) {
          const prevRoom = rooms.get(ws.clientInfo.roomId);
          if (prevRoom) {
            prevRoom.clients.delete(ws);
            removeEmptyRoom(ws.clientInfo.roomId);
          }
        }
        
        // Добавляем клиента в новую комнату
        room.clients.add(ws);
        ws.clientInfo.roomId = roomId;
        
        console.log(`Клиент присоединился к комнате: ${roomId}`);
        
        ws.send(JSON.stringify({
          type: 'room_joined',
          roomId: roomId,
          clientsInRoom: room.clients.size,
          timestamp: new Date().toISOString()
        }));
        
        // Уведомляем других клиентов в комнате
        room.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'client_joined',
              roomId: roomId,
              clientsInRoom: room.clients.size,
              timestamp: new Date().toISOString()
            }));
          }
        });
        
        return;
      }
      
      // Обработка выхода из комнаты
      if (message.type === 'leave_room') {
        if (ws.clientInfo.roomId) {
          const room = rooms.get(ws.clientInfo.roomId);
          if (room) {
            room.clients.delete(ws);
            removeEmptyRoom(ws.clientInfo.roomId);
            
            // Уведомляем других клиентов в комнате
            room.clients.forEach((client) => {
              if (client.readyState === 1) {
                client.send(JSON.stringify({
                  type: 'client_left',
                  roomId: ws.clientInfo.roomId,
                  clientsInRoom: room.clients.size,
                  timestamp: new Date().toISOString()
                }));
              }
            });
            
            console.log(`Клиент покинул комнату: ${ws.clientInfo.roomId}`);
            ws.clientInfo.roomId = null;
            
            ws.send(JSON.stringify({
              type: 'room_left',
              timestamp: new Date().toISOString()
            }));
          }
        }
        return;
      }
      
      // Обработка запроса фигур
      if (message.type === 'request_shapes') {
        if (!ws.clientInfo.roomId) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Сначала присоединитесь к комнате',
            timestamp: new Date().toISOString()
          }));
          return;
        }
        
        const room = rooms.get(ws.clientInfo.roomId);
        if (room) {
          ws.send(JSON.stringify({
            type: 'shapes_response',
            roomId: ws.clientInfo.roomId,
            count: room.shapes.length,
            timestamp: new Date().toISOString(),
            data: room.shapes
          }));
          console.log(`Отправлены ${room.shapes.length} фигур клиенту в комнате ${ws.clientInfo.roomId}`);
        }
        
        return;
      }
      
      // Проверяем, что сообщение содержит массив объектов
      if (Array.isArray(message)) {
        console.log('Получен массив объектов:', message);
        
        // Проверяем, что клиент находится в комнате
        if (!ws.clientInfo.roomId) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Сначала присоединитесь к комнате',
            timestamp: new Date().toISOString()
          }));
          return;
        }
        
        // Сохраняем фигуры в комнате
        const room = rooms.get(ws.clientInfo.roomId);
        if (room) {
          room.shapes = message; // Обновляем фигуры в комнате
          console.log(`Сохранено ${message.length} фигур в комнате ${ws.clientInfo.roomId}`);
        }
        
        // Обрабатываем каждый объект в массиве
        message.forEach((obj, index) => {
          console.log(`Объект ${index + 1} в комнате ${ws.clientInfo.roomId}:`, obj);
        });
        
        // Отправляем подтверждение обратно клиенту
        ws.send(JSON.stringify({
          type: 'array_received',
          roomId: ws.clientInfo.roomId,
          count: message.length,
          timestamp: new Date().toISOString(),
          data: message
        }));
        
        // Рассылаем сообщение всем клиентам в той же комнате (кроме отправителя)
        if (room) {
          room.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'broadcast',
                roomId: ws.clientInfo.roomId,
                count: message.length,
                timestamp: new Date().toISOString(),
                data: message
              }));
            }
          });
        }
        
      } else if (message.type !== 'join_room' && message.type !== 'leave_room') {
        // Если это не массив и не команда управления комнатами, отправляем ошибку
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Ожидается массив объектов или команда управления комнатами',
          received: typeof message,
          timestamp: new Date().toISOString()
        }));
      }
      
    } catch (error) {
      console.error('Ошибка при обработке сообщения:', error);
      
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Неверный формат JSON',
        error: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  });

  ws.on('close', () => {
    console.log('Клиент отключился');
    
    // Удаляем клиента из комнаты при отключении
    if (ws.clientInfo.roomId) {
      const room = rooms.get(ws.clientInfo.roomId);
      if (room) {
        room.clients.delete(ws);
        removeEmptyRoom(ws.clientInfo.roomId);
        
        // Уведомляем других клиентов в комнате
        room.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'client_disconnected',
              roomId: ws.clientInfo.roomId,
              clientsInRoom: room.clients.size,
              timestamp: new Date().toISOString()
            }));
          }
        });
      }
    }
  });

  ws.on('error', (error) => {
    console.error('Ошибка WebSocket:', error);
    
    // Удаляем клиента из комнаты при ошибке
    if (ws.clientInfo.roomId) {
      const room = rooms.get(ws.clientInfo.roomId);
      if (room) {
        room.clients.delete(ws);
        removeEmptyRoom(ws.clientInfo.roomId);
      }
    }
  });
});

// Обработка завершения работы сервера
process.on('SIGINT', () => {
  console.log('\nЗавершение работы сервера...');
  wss.close(() => {
    console.log('Сервер остановлен');
    process.exit(0);
  });
});

console.log('Сервер готов к приему подключений'); 