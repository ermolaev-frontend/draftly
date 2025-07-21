# Draftly

A real-time collaborative drawing application with a hand-drawn aesthetic.

## Description

**Draftly** is a modern web application for real-time collaborative sketching and drawing. Built with React and TypeScript, it features a hand-drawn aesthetic powered by RoughJS, supporting multiple drawing tools, real-time collaboration via WebSocket, and automatic state persistence.

### Features

- **Drawing Tools**: Rectangle, Circle, Line, and Freehand Pencil
- **Interactive Canvas**: Select, move, resize, and rotate shapes
- **Real-time Collaboration**: Multiple users can draw simultaneously
- **Theme Support**: Light and dark mode toggle
- **Color Picker**: Custom color selection for shapes
- **Responsive Design**: Works on desktop and touch devices
- **Auto-save**: Canvas state automatically saved to localStorage
- **Keyboard Shortcuts**: 
  - `Escape` - Deselect current shape
  - `Delete/Backspace` - Delete selected shape
- **Touch Support**: Full touch event handling for mobile devices

### Architecture

The application follows a modular architecture with clear separation of concerns:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js WebSocket server
- **Drawing Engine**: Custom canvas-based rendering with RoughJS
- **State Management**: Reactive state system with automatic updates
- **Styling**: SCSS modules with CSS custom properties

### Technologies

#### Frontend
- **React 19.1.0** - UI framework
- **TypeScript 5.8.3** - Type safety
- **Vite 7.0.0** - Build tool and dev server
- **RoughJS 4.6.6** - Hand-drawn style rendering
- **SCSS** - Styling with CSS modules
- **FontAwesome 6.7.2** - Icons
- **Jest** - Testing framework

#### Backend
- **Node.js** - Runtime environment
- **WebSocket (ws 8.16.0)** - Real-time communication
- **ES Modules** - Modern JavaScript modules

#### Deployment
- **Docker** - Containerization
- **Caddy** - Production web server
- **pnpm** - Package manager

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Git

### Environment Setup

1. **Frontend Environment** (create `frontend/.env`):
```bash
# WebSocket Server Configuration
VITE_WS_SERVER_URL=ws://localhost:3002
VITE_WS_SERVER_PORT=3002

# Client Configuration
VITE_DEFAULT_ROOM_ID=room1
```

2. **Backend Environment** (create `backend/.env`):
```bash
# Server Configuration
PORT=3002
NODE_ENV=development
```

### Development

#### Quick Start (Recommended)
Use the provided development script:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

This will start both frontend and backend servers automatically.

#### Manual Setup

1. **Install Dependencies**:
```bash
# Frontend
cd frontend
pnpm install

# Backend
cd backend
npm install
```

2. **Start Backend Server**:
```bash
cd backend
npm run dev
```

3. **Start Frontend Development Server**:
```bash
cd frontend
pnpm dev
```

4. **Access the Application**:
- Frontend: http://localhost:5173
- Backend WebSocket: ws://localhost:3002

### Building for Production

```bash
cd frontend
pnpm build
pnpm preview
```

### Docker Deployment

```bash
cd frontend
docker-compose up --build
```

The application will be available at: http://localhost:8080

### Testing

```bash
cd frontend
pnpm test              # Run tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
pnpm test:ci          # CI mode
```

### Code Quality

```bash
cd frontend
pnpm lint             # ESLint
pnpm ci               # Full CI pipeline (lint + test + build)
```

## Project Structure

```
draftly/
├── frontend/                 # React application
│   ├── src/
│   │   ├── app/             # App entry point
│   │   ├── entities/        # Business logic
│   │   │   └── canvas/      # Canvas and drawing logic
│   │   ├── pages/           # Page components
│   │   ├── shared/          # Shared utilities and types
│   │   └── widgets/         # UI components
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # WebSocket server
│   ├── handlers/            # Message handlers
│   ├── services/            # Business services
│   ├── utils/               # Utilities
│   └── index.js
├── start-dev.sh             # Development startup script
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the Apache License, Version 2.0.

---

## Author

Evgeny Ermolaev

 