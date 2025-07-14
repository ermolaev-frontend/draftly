import { config } from '../config.js';

export class MessageBuilder {
  static createMessage(type, data = {}) {
    return JSON.stringify({
      type,
      timestamp: new Date().toISOString(),
      ...data
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
    if (client !== excludeClient && client?.readyState === 1) {
      client.send(message);
    }
  });
} 