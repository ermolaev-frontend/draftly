# CanvasEditor Class

The `CanvasEditor` class provides a feature-rich, interactive canvas editor for drawing, manipulating, and managing shapes (rectangles, circles, lines, and freehand pencil lines) on an HTML canvas. It is designed for use in modern web applications and supports selection, resizing, rotation, and real-time drawing with mouse events.

## Overview

- **Location:** `src/entities/canvas/CanvasEditor.ts`
- **Purpose:** Encapsulates all logic for rendering, interacting with, and managing shapes on a canvas element.
- **Shapes Supported:** Rectangle, Circle, Line, Pencil (freehand)
- **Features:**
  - Drawing new shapes with mouse
  - Selecting, moving, resizing, and rotating shapes
  - Pencil tool with smoothing and simplification
  - Auto-saving shapes to localStorage
  - Responsive resizing to parent container

## Main Properties

| Property         | Type                        | Description                                      |
|-----------------|-----------------------------|--------------------------------------------------|
| `canvas`        | `HTMLCanvasElement`         | The canvas DOM element being managed              |
| `ctx`           | `CanvasRenderingContext2D`  | The 2D rendering context for the canvas           |
| `shapes`        | `Shape[]`                   | Array of all shapes currently on the canvas       |
| `currentTool`   | `ToolType`                  | The currently selected drawing tool               |
| `interaction`   | `InteractionState`          | State for current user interaction (drag, resize) |

## Constructor

```
new CanvasEditor(canvasId: string)
```
- **canvasId:** The DOM id of the canvas element to control.
- Initializes the canvas, context, event listeners, and populates with random shapes.

## Key Methods

### Shape Management
- `addRectangle()`: Add a new random rectangle.
- `addCircle()`: Add a new random circle.
- `addLine()`: Add a new random line.
- `addRandomShape()`: Add a random shape (rectangle, circle, or line).
- `clearCanvas()`: Remove all shapes from the canvas.

### Tool & Drawing
- `setTool(toolName: ToolType)`: Set the current drawing tool (e.g., 'select', 'rectangle', 'circle', 'line', 'pencil').
- Mouse event handlers (`onMouseDown`, `onMouseMove`, `onMouseUp`) handle drawing, selection, dragging, resizing, and rotating shapes.

### Rendering
- `drawShapes()`: Redraw all shapes and their selection states.
- `drawShape(shape: Shape)`: Draw a single shape.
- `drawSelection(shape: Shape)`: Draw selection frame and handles for a shape.
- `redraw()`: Alias for `drawShapes()`.

### Utility & Helpers
- `resizeCanvasToWrapper()`: Resize the canvas to fit its parent container.
- `autoSave()`: Save the current shapes to localStorage.
- Private helpers for hit-testing, handle detection, shape creation, and geometry calculations.

## Example Usage

```ts
import { CanvasEditor } from './CanvasEditor';

// Assuming there is a <canvas id="my-canvas"></canvas> in your HTML
const editor = new CanvasEditor('my-canvas');

// Switch to rectangle tool
document.getElementById('rect-btn').onclick = () => editor.setTool('rectangle');

// Add a random shape
document.getElementById('random-btn').onclick = () => editor.addRandomShape();

// Clear all shapes
document.getElementById('clear-btn').onclick = () => editor.clearCanvas();
```

## Events & Interactivity
- Mouse events are attached to the canvas for drawing, selecting, dragging, resizing, and rotating shapes.
- The cursor changes contextually based on the current tool and interaction state.

## Auto-Save
- The editor automatically saves the current shapes to `localStorage` under the key `'shapes'` after each interaction.

## Extensibility
- The class is designed to be extensible for new shape types or tools.
- All shape types and interaction states are defined in `src/shared/types/canvas.ts`.

---

For detailed type definitions, see [`src/shared/types/canvas.ts`](../../shared/types/canvas.ts). 