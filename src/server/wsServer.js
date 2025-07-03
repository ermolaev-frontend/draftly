import { WebSocketServer } from 'ws';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

// Demo shapes for initial state
let shapes = [
  // Rectangle
  {
    id: 'rect1',
    type: 'rectangle',
    color: '#ff6b6b',
    strokeWidth: 3,
    selected: false,
    x: 100,
    y: 100,
    width: 150,
    height: 100,
    rotation: 0
  },
  // Circle
  {
    id: 'circle1',
    type: 'circle',
    color: '#4ecdc4',
    strokeWidth: 3,
    selected: false,
    x: 350,
    y: 200,
    radius: 60
  },
  // Line
  {
    id: 'line1',
    type: 'line',
    color: '#45b7d1',
    strokeWidth: 3,
    selected: false,
    x1: 200,
    y1: 300,
    x2: 400,
    y2: 350
  },
  // Pencil
  {
    id: 'pencil1',
    type: 'pencil',
    color: '#dda0dd',
    strokeWidth: 2,
    selected: false,
    points: [
      { x: 500, y: 100 },
      { x: 520, y: 120 },
      { x: 540, y: 110 },
      { x: 560, y: 130 }
    ]
  }
];

wss.on('connection', (ws) => {
  // Send current shapes to the new client
  ws.send(JSON.stringify({ type: 'init', shapes }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'add_shape') {
        shapes.push(data.shape);
        // Broadcast new shape to all clients
        broadcast({ type: 'add_shape', shape: data.shape }, ws);
      } else if (data.type === 'set_shapes') {
        shapes = data.shapes;
        broadcast({ type: 'set_shapes', shapes }, ws);
      } else if (data.type === 'clear_shapes') {
        shapes = [];
        broadcast({ type: 'clear_shapes' }, ws);
      }
    } catch (e) {
      console.error('Invalid message', e);
    }
  });

  ws.on('close', () => {
    // Optionally handle disconnects
  });
});

function broadcast(data, ws) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    // 1 === WebSocket.OPEN
    if (client.readyState === 1 && client !== ws) {
      client.send(msg);
    }
  });
}

console.log(`WebSocket server running on ws://localhost:${PORT}`); 