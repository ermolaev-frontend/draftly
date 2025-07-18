export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  getOrCreateRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        clients: new Set(),
        shapes: []
      });
      console.log(`New room created: ${roomId}`);
    }
    return this.rooms.get(roomId);
  }

  removeEmptyRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room?.clients.size === 0) {
      this.rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    }
  }

  addClientToRoom(roomId, client) {
    const room = this.getOrCreateRoom(roomId);
    room.clients.add(client);
    client.clientInfo.roomId = roomId;
    console.log(`Client joined room: ${roomId}`);
    return room;
  }

  removeClientFromRoom(client) {
    if (!client.clientInfo.roomId) return null;

    const room = this.rooms.get(client.clientInfo.roomId);
    if (room) {
      room.clients.delete(client);
      this.removeEmptyRoom(client.clientInfo.roomId);
      console.log(`Client left room: ${client.clientInfo.roomId}`);
      client.clientInfo.roomId = null;
      return room;
    }
    return null;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getClientRoom(client) {
    if (!client.clientInfo.roomId) return null;
    return this.rooms.get(client.clientInfo.roomId);
  }

  updateShapes(roomId, shapes) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.shapes = shapes;
      console.log(`Saved ${shapes.length} shapes in room ${roomId}`);
      return true;
    }
    return false;
  }

  getShapes(roomId) {
    const room = this.rooms.get(roomId);
    return room?.shapes ?? [];
  }

  addShape(roomId, shape) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.shapes.push(shape);
      console.log(`Added shape with id ${shape.id} to room ${roomId}`);
      return true;
    }
    return false;
  }

  updateShape(roomId, shape) {
    const room = this.rooms.get(roomId);
    if (room) {
      const idx = room.shapes.findIndex(s => s.id === shape.id);
      if (idx !== -1) {
        room.shapes[idx] = shape;
        console.log(`Updated shape with id ${shape.id} in room ${roomId}`);
        return true;
      }
    }
    return false;
  }

  deleteShape(roomId, shapeId) {
    const room = this.rooms.get(roomId);
    if (room) {
      const idx = room.shapes.findIndex(s => s.id === shapeId);
      if (idx !== -1) {
        room.shapes.splice(idx, 1);
        console.log(`Deleted shape with id ${shapeId} from room ${roomId}`);
        return true;
      }
    }
    return false;
  }

  getAvailableRooms() {
    return Array.from(this.rooms.keys());
  }

  getRoomStats() {
    const stats = {};
    this.rooms.forEach((room, roomId) => {
      stats[roomId] = {
        clientsCount: room.clients.size,
        shapesCount: room.shapes.length
      };
    });
    return stats;
  }
} 