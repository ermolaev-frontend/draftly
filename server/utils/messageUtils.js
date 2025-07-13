import { config } from '../config.js';

export class MessageBuilder {
  static createMessage(type, data = {}) {
    return JSON.stringify({
      type,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  static createConnectionMessage(availableRooms) {
    return this.createMessage(config.MESSAGE_TYPES.CONNECTION, {
      message: 'Connection established',
      availableRooms
    });
  }

  static createRoomJoinedMessage(roomId, clientsInRoom) {
    return this.createMessage(config.MESSAGE_TYPES.ROOM_JOINED, {
      roomId,
      clientsInRoom
    });
  }

  static createRoomLeftMessage() {
    return this.createMessage(config.MESSAGE_TYPES.ROOM_LEFT);
  }

  static createClientJoinedMessage(roomId, clientsInRoom) {
    return this.createMessage(config.MESSAGE_TYPES.CLIENT_JOINED, {
      roomId,
      clientsInRoom
    });
  }

  static createClientLeftMessage(roomId, clientsInRoom) {
    return this.createMessage(config.MESSAGE_TYPES.CLIENT_LEFT, {
      roomId,
      clientsInRoom
    });
  }

  static createClientDisconnectedMessage(roomId, clientsInRoom) {
    return this.createMessage(config.MESSAGE_TYPES.CLIENT_DISCONNECTED, {
      roomId,
      clientsInRoom
    });
  }

  static createShapesResponseMessage(roomId, count, data) {
    return this.createMessage(config.MESSAGE_TYPES.SHAPES_RESPONSE, {
      roomId,
      count,
      data
    });
  }

  static createArrayReceivedMessage(roomId, count, data) {
    return this.createMessage(config.MESSAGE_TYPES.ARRAY_RECEIVED, {
      roomId,
      count,
      data
    });
  }

  static createBroadcastMessage(roomId, count, data) {
    return this.createMessage(config.MESSAGE_TYPES.BROADCAST, {
      roomId,
      count,
      data
    });
  }

  static createErrorMessage(message, additionalData = {}) {
    return this.createMessage(config.MESSAGE_TYPES.ERROR, {
      message,
      ...additionalData
    });
  }
}

export function parseMessage(data) {
  try {
    return JSON.parse(data);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

export function broadcastToRoom(room, message, excludeClient = null) {
  room.clients.forEach((client) => {
    if (client !== excludeClient && client.readyState === 1) {
      client.send(message);
    }
  });
} 