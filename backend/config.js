export const config = {
  PORT: process.env.PORT ?? 3002,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  MESSAGE_TYPES: {
    JOIN_ROOM: 'join_room',
    BROADCAST: 'broadcast',
    ERROR: 'error',
    ADD_SHAPE: 'add_shape',
    UPDATE_SHAPE: 'update_shape',
    DELETE_SHAPE: 'delete_shape',
    EMPTY_SHAPES: 'empty_shapes'
  }
}; 