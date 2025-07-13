# Draftly WebSocket Server

Refactored WebSocket server for Draftly application with modular architecture.

## Project Structure

```
server/
├── index.js                 # Entry point
├── config.js               # Configuration
├── WebSocketServer.js      # Main server class
├── services/
│   └── RoomManager.js      # Room management
├── handlers/
│   └── MessageHandler.js   # Message handling
├── utils/
│   └── messageUtils.js     # Message utilities
└── README.md              # Documentation
```

## Modules

### config.js
Centralized server configuration:
- Server port
- Message types

### WebSocketServer.js
Main server class:
- WebSocket server initialization
- Connection management
- Graceful shutdown

### RoomManager.js
Room management:
- Create/delete rooms
- Add/remove clients
- Store shapes for each room
- Room statistics

### MessageHandler.js
Message handling:
- Parse incoming messages
- Handle room management commands
- Handle shape arrays
- Message validation

### messageUtils.js
Message utilities:
- Create typed messages
- JSON parsing
- Broadcast messages to rooms

## Refactoring Benefits

1. **Modularity**: Each module is responsible for its own area
2. **Readability**: Code became more structured and understandable
3. **Testability**: Modules can be tested independently
4. **Extensibility**: Easy to add new features
5. **DRY principle**: Eliminated code duplication
6. **Typing**: Centralized message types

## Running

```bash
cd server
npm start
```

Server will start on port 3002 (or PORT from environment variables). 