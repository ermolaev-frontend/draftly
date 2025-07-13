export const config = {
  PORT: process.env.PORT ?? 3002,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  MESSAGE_TYPES: {
    JOIN_ROOM: 'join_room',
    BROADCAST: 'broadcast',
    ERROR: 'error'
  }
}; 