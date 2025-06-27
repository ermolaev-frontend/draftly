import { CanvasEditor } from './CanvasEditor.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvasEditor = new CanvasEditor('canvas');
    document.getElementById('addRectangleButton').addEventListener('click', () => canvasEditor.addRectangle());
    document.getElementById('addCircleButton').addEventListener('click', () => canvasEditor.addCircle());
    document.getElementById('addLineButton').addEventListener('click', () => canvasEditor.addLine());
    document.getElementById('clearCanvasButton').addEventListener('click', () => canvasEditor.clearCanvas());
    document.getElementById('pencilButton').addEventListener('click', () => canvasEditor.setTool('pencil'));
    document.getElementById('selectButton').addEventListener('click', () => canvasEditor.setTool('select'));
    document.getElementById('saveButton').addEventListener('click', () => {
        console.log(canvasEditor.shapes);
        localStorage.setItem('shapes', JSON.stringify(canvasEditor.shapes));
    });

    function setActiveToolButton(tool) {
        document.getElementById('selectButton').classList.remove('active-tool');
        document.getElementById('pencilButton').classList.remove('active-tool');
        if (tool === 'select') {
            document.getElementById('selectButton').classList.add('active-tool');
        } else if (tool === 'pencil') {
            document.getElementById('pencilButton').classList.add('active-tool');
        }
    }
    // Инициализация: по умолчанию select
    setActiveToolButton('select');
    document.getElementById('pencilButton').addEventListener('click', () => {
        canvasEditor.setTool('pencil');
        setActiveToolButton('pencil');
    });
    document.getElementById('selectButton').addEventListener('click', () => {
        canvasEditor.setTool('select');
        setActiveToolButton('select');
    });
}); 