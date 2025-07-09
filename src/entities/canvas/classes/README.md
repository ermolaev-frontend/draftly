# Canvas Classes

This directory contains the core TypeScript classes for Draftly's canvas drawing and editing functionality. Each class encapsulates the logic, properties, and behaviors for a specific drawable object or editor feature. These classes are used by the canvas editor to render, manipulate, and interact with shapes on the canvas.

## Overview

The classes in this folder provide the building blocks for:
- Drawing geometric shapes (Rectangle, Circle, Line)
- Freehand drawing (Pencil)
- Managing the canvas state and user interactions (Draftly, Interaction)

---

## Class Descriptions

### Draftly.ts
- **Purpose:** Central manager for the canvas. Handles the lifecycle of shapes, drawing operations, selection, undo/redo, and user input.
- **Responsibilities:**
  - Add, remove, and update shapes
  - Manage selection and active tool
  - Handle mouse/touch events and delegate to shapes
  - Coordinate rendering and state updates
- **Usage:** Instantiate once per canvas. Use its methods to manipulate shapes and respond to user actions.

### Rectangle.ts
- **Purpose:** Represents a rectangle shape on the canvas.
- **Responsibilities:**
  - Store rectangle properties (position, size, style)
  - Draw itself on the canvas context
  - Support resizing, moving, and hit-testing
- **Usage:** Created by the editor when the rectangle tool is active. Can be manipulated via the editor or directly.

### Circle.ts
- **Purpose:** Represents a circle/ellipse shape.
- **Responsibilities:**
  - Store center, radius, and style
  - Draw itself on the canvas
  - Support resizing, moving, and hit-testing
- **Usage:** Used for drawing and editing circular shapes.

### Line.ts
- **Purpose:** Represents a straight line segment.
- **Responsibilities:**
  - Store start/end points and style
  - Draw itself on the canvas
  - Support moving and hit-testing
- **Usage:** Used for drawing and manipulating lines.

### Pencil.ts
- **Purpose:** Represents a freehand (pencil) drawing path.
- **Responsibilities:**
  - Store a sequence of points (the path)
  - Render a smooth, hand-drawn line
  - Support erasing, hit-testing, and editing
- **Usage:** Used for freehand drawing. Paths are created as the user draws with the pencil tool.

### Interaction.ts
- **Purpose:** Utility for handling user interactions with shapes.
- **Responsibilities:**
  - Provide helpers for selection, dragging, and manipulation
  - Abstract common interaction logic for reuse
- **Usage:** Used internally by the editor and shapes to manage user input.

---

## Extending and Contributing

- **Adding New Shapes:**
  - Create a new class in this folder, following the structure of existing shapes.
  - Implement methods for drawing, hit-testing, and manipulation.
  - Register the new shape with the `Draftly` if needed.

- **Modifying Behavior:**
  - Prefer extending existing classes or using composition over direct modification.
  - Ensure changes are type-safe and covered by tests if possible.

- **Contributing:**
  - Follow TypeScript best practices and project coding standards.
  - Document new classes and methods clearly.

---

## Notes
- All classes are strictly typed with TypeScript.
- Designed for extensibility and maintainability.
- Used internally by the canvas editor and related UI components. 