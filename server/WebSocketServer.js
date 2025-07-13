import { WebSocketServer } from 'ws';
import { config } from './config.js';
import { MessageBuilder } from './utils/messageUtils.js';
import { RoomManager } from './services/RoomManager.js';
import { MessageHandler } from './handlers/MessageHandler.js';

export class DraftlyWebSocketServer {
  constructor(port = config.PORT) {
    this.port = port;
    this.wss = null;
    this.roomManager = new RoomManager();
    this.messageHandler = new MessageHandler(this.roomManager);
  }

  initialize() {
    this.wss = new WebSocketServer({ port: this.port });
    this.setupEventHandlers();
    console.log(`WebSocket server started on port ${this.port}`);
  }

  setupEventHandlers() {
    this.wss.on('connection', (ws) => this.handleConnection(ws));
    
    // Server shutdown handling
    process.on('SIGINT', () => this.gracefulShutdown());
  }

  handleConnection(ws) {
    console.log('New connection established');
    
    // Initialize client information
    this.initializeClient(ws);
    
    // Send welcome message
    this.sendWelcomeMessage(ws);
    
    // Setup event handlers for client
    this.setupClientEventHandlers(ws);
  }

  initializeClient(ws) {
    ws.clientInfo = {
      roomId: null,
      connectedAt: new Date()
    };
  }

  sendWelcomeMessage(ws) {
    const availableRooms = this.roomManager.getAvailableRooms();
    ws.send(MessageBuilder.createConnectionMessage(availableRooms));
  }

  setupClientEventHandlers(ws) {
    ws.on('message', (data) => {
      this.messageHandler.handleMessage(ws, data);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      this.messageHandler.handleClientDisconnect(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.messageHandler.handleClientDisconnect(ws);
    });
  }

  gracefulShutdown() {
    console.log('\nShutting down server...');
    if (this.wss) {
      this.wss.close(() => {
        console.log('Server stopped');
        process.exit(0);
      });
    }
  }

  getStats() {
    return {
      port: this.port,
      connections: this.wss?.clients.size ?? 0,
      rooms: this.roomManager.getRoomStats()
    };
  }
} 