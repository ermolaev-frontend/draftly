export const config = {
  PORT: process.env.PORT ?? 3002,
  MESSAGE_TYPES: {
    JOIN_ROOM: 'join_room',
    BROADCAST: 'broadcast',
    ERROR: 'error'
  }
}; 