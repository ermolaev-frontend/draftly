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
        case config.MESSAGE_TYPES.LEAVE_ROOM:
          return this.handleLeaveRoom(ws, message);
        case config.MESSAGE_TYPES.REQUEST_SHAPES:
          return this.handleRequestShapes(ws, message);
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
    const prevRoom = this.roomManager.removeClientFromRoom(ws);
    if (prevRoom) {
      broadcastToRoom(prevRoom, MessageBuilder.createClientLeftMessage(
        ws.clientInfo.roomId, 
        prevRoom.clients.size
      ));
    }
    
    // Add client to new room
    const room = this.roomManager.addClientToRoom(roomId, ws);
    
    // Send confirmation to client
    ws.send(MessageBuilder.createRoomJoinedMessage(roomId, room.clients.size));
    
    // Notify other clients in the room
    broadcastToRoom(room, MessageBuilder.createClientJoinedMessage(
      roomId, 
      room.clients.size
    ), ws);
  }

  handleLeaveRoom(ws, message) {
    const room = this.roomManager.removeClientFromRoom(ws);
    if (room) {
      // Notify other clients in the room
      broadcastToRoom(room, MessageBuilder.createClientLeftMessage(
        ws.clientInfo.roomId, 
        room.clients.size
      ));
      
      ws.send(MessageBuilder.createRoomLeftMessage());
    }
  }

  handleRequestShapes(ws, message) {
    if (!ws.clientInfo.roomId) {
      ws.send(MessageBuilder.createErrorMessage('Please join a room first'));
      return;
    }
    
    const shapes = this.roomManager.getShapes(ws.clientInfo.roomId);
    ws.send(MessageBuilder.createShapesResponseMessage(
      ws.clientInfo.roomId,
      shapes.length,
      shapes
    ));
    console.log(`Sent ${shapes.length} shapes to client in room ${ws.clientInfo.roomId}`);
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
      
      // Send confirmation back to client
      ws.send(MessageBuilder.createArrayReceivedMessage(
        ws.clientInfo.roomId,
        shapes.length,
        shapes
      ));
      
      // Broadcast message to all clients in the same room (except sender)
      broadcastToRoom(room, MessageBuilder.createBroadcastMessage(
        ws.clientInfo.roomId,
        shapes.length,
        shapes
      ), ws);
    }
  }

  handleUnknownMessage(ws, message) {
    ws.send(MessageBuilder.createErrorMessage(
      'Unknown message type',
      { received: typeof message }
    ));
  }

  handleClientDisconnect(ws) {
    const room = this.roomManager.removeClientFromRoom(ws);
    if (room) {
      broadcastToRoom(room, MessageBuilder.createClientDisconnectedMessage(
        ws.clientInfo.roomId,
        room.clients.size
      ));
    }
  }
} 