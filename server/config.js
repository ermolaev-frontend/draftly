export const config = {
  PORT: process.env.PORT ?? 3002,
  MESSAGE_TYPES: {
    CONNECTION: 'connection',
    JOIN_ROOM: 'join_room',
    LEAVE_ROOM: 'leave_room',
    ROOM_JOINED: 'room_joined',
    ROOM_LEFT: 'room_left',
    CLIENT_JOINED: 'client_joined',
    CLIENT_LEFT: 'client_left',
    CLIENT_DISCONNECTED: 'client_disconnected',
    REQUEST_SHAPES: 'request_shapes',
    SHAPES_RESPONSE: 'shapes_response',
    ARRAY_RECEIVED: 'array_received',
    BROADCAST: 'broadcast',
    ERROR: 'error'
  }
}; 