# Draftly

## Description

**Draftly** is a simple and creative web app for quickly sketching ideas, visualizing concepts, and rapid prototyping. It provides an interactive canvas with tools for drawing shapes (rectangle, circle, line, pencil), selecting and moving objects, and supports both light and dark themes. All changes are automatically saved in the browser's localStorage.

### Features

- Draw rectangles, circles, lines, and freehand curves (pencil)
- Select and move objects
- Delete selected objects (Delete/Backspace keys)
- Clear the entire canvas
- Switch between light and dark themes
- Responsive interface
- Automatic canvas state saving in the browser
- Keyboard shortcuts (Escape — select, Delete — delete)
- Touch device support (touch events)
- Real-time collaboration via WebSocket

### Technologies

- React 19.1.0
- TypeScript 5.8.3
- Vite 7.0.0
- roughjs 4.6.6 (hand-drawn style)
- SCSS (Sass 1.89.2)
- FontAwesome 6.7.2 (icons)
- WebSocket (real-time communication)
- Caddy (production server)
- pnpm 8.x (package manager)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# WebSocket Server Configuration
VITE_WS_SERVER_URL=ws://localhost:3002
VITE_WS_SERVER_PORT=3002

# Client Configuration
VITE_DEFAULT_ROOM_ID=room1
```

For the server, create a `server/.env` file:

```bash
# Server Configuration
PORT=3002
NODE_ENV=development
```

### Local Development

1. Install dependencies:

```bash
pnpm install
```

2. Start the WebSocket server:

```bash
cd server
npm start
```

3. Start the client in development mode:

```bash
pnpm dev
```

The app will be available at: http://localhost:5173

4. Build for production:

```bash
pnpm build
```

5. Preview production build:

```bash
pnpm preview
```

### Docker

```bash
cd ci
docker-compose up --build
```

The app will be available at: http://localhost:8080

---

## Author

Evgeny Ermolaev 