import { DraftlyWebSocketServer } from './WebSocketServer.js';

// Create and start server
const server = new DraftlyWebSocketServer();
server.initialize();

console.log('Server ready to accept connections');

// Export for possible use in tests
export { server }; 