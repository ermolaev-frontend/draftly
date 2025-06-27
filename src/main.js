import { CanvasEditor } from './CanvasEditor.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvasEditor = new CanvasEditor('canvas');
    document.getElementById('addRectangleButton').addEventListener('click', () => canvasEditor.addRectangle());
    document.getElementById('addCircleButton').addEventListener('click', () => canvasEditor.addCircle());
    document.getElementById('addLineButton').addEventListener('click', () => canvasEditor.addLine());
    document.getElementById('clearCanvasButton').addEventListener('click', () => canvasEditor.clearCanvas());
}); 