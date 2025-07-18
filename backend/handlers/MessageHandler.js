import { config } from '../config.js';
import { MessageBuilder, parseMessage, broadcastToRoom } from '../utils/messageUtils.js';

export class MessageHandler {
  constructor(roomManager) {
    this.roomManager = roomManager;
  }

  handleMessage(ws, data) {
    try {
      const message = parseMessage(data);
      console.log('Message received:', message);

      if (Array.isArray(message)) {
        return this.handleShapesArray(ws, message);
      }

      switch (message.type) {
        case config.MESSAGE_TYPES.JOIN_ROOM:
          return this.handleJoinRoom(ws, message);
        case config.MESSAGE_TYPES.ADD_SHAPE:
          return this.handleAddShape(ws, message);
        case config.MESSAGE_TYPES.UPDATE_SHAPE:
          return this.handleUpdateShape(ws, message);
        case config.MESSAGE_TYPES.DELETE_SHAPE:
          return this.handleDeleteShape(ws, message);
        case config.MESSAGE_TYPES.EMPTY_SHAPES:
          return this.handleEmptyShapes(ws, message);
        default:
          return this.handleUnknownMessage(ws, message);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(MessageBuilder.createErrorMessage('Message processing error', {
        error: error.message
      }));
    }
  }

  handleJoinRoom(ws, message) {
    const roomId = message.roomId;
    
    // Remove client from previous room
    this.roomManager.removeClientFromRoom(ws);
    
    // Add client to new room
    const room = this.roomManager.addClientToRoom(roomId, ws);
    
    // Send current shapes to the client
    if (room.shapes.length > 0) {
      ws.send(MessageBuilder.createBroadcastMessage(
        roomId,
        room.shapes.length,
        room.shapes
      ));
    }
  }

  handleShapesArray(ws, shapes) {
    if (!ws.clientInfo.roomId) {
      ws.send(MessageBuilder.createErrorMessage('Please join a room first'));
      return;
    }
    
    // Save shapes in the room
    const room = this.roomManager.getClientRoom(ws);
    if (room) {
      this.roomManager.updateShapes(ws.clientInfo.roomId, shapes);
      
      // Broadcast message to all clients in the same room (except sender)
      broadcastToRoom(room, MessageBuilder.createBroadcastMessage(
        ws.clientInfo.roomId,
        shapes.length,
        shapes
      ), ws);
    }
  }

  withRoom(ws, callback) {
    if (!ws.clientInfo.roomId) {
      ws.send(MessageBuilder.createErrorMessage('Please join a room first'));
      return;
    }
    const room = this.roomManager.getClientRoom(ws);
    if (room) {
      callback(room);
    }
  }

  handleAddShape(ws, message) {
    this.withRoom(ws, (room) => {
      if (message.shape) {
        this.roomManager.addShape(ws.clientInfo.roomId, message.shape);
        broadcastToRoom(room, MessageBuilder.createMessage(config.MESSAGE_TYPES.ADD_SHAPE, { shape: message.shape }), ws);
      }
    });
  }

  handleUpdateShape(ws, message) {
    this.withRoom(ws, (room) => {
      if (message.shape) {
        this.roomManager.updateShape(ws.clientInfo.roomId, message.shape);
        broadcastToRoom(room, MessageBuilder.createMessage(config.MESSAGE_TYPES.UPDATE_SHAPE, { shape: message.shape }), ws);
      }
    });
  }

  handleDeleteShape(ws, message) {
    this.withRoom(ws, (room) => {
      if (message.shapeId) {
        this.roomManager.deleteShape(ws.clientInfo.roomId, message.shapeId);
        broadcastToRoom(room, MessageBuilder.createMessage(config.MESSAGE_TYPES.DELETE_SHAPE, { shapeId: message.shapeId }), ws);
      }
    });
  }

  handleEmptyShapes(ws, message) {
    this.withRoom(ws, (room) => {
      this.roomManager.updateShapes(ws.clientInfo.roomId, []);
      broadcastToRoom(room, MessageBuilder.createMessage(config.MESSAGE_TYPES.EMPTY_SHAPES, {}), ws);
    });
  }

  handleUnknownMessage(ws, message) {
    ws.send(MessageBuilder.createErrorMessage(
      'Unknown message type',
      { received: typeof message }
    ));
  }

  handleClientDisconnect(ws) {
    this.roomManager.removeClientFromRoom(ws);
  }
} 