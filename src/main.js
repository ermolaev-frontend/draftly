import { CanvasEditor } from './CanvasEditor.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvasEditor = new CanvasEditor('canvas');
    document.getElementById('addRectangleButton').addEventListener('click', () => {
        canvasEditor.setTool('rectangle');
        setActiveToolButton('rectangle');
    });
    document.getElementById('addCircleButton').addEventListener('click', () => {
        canvasEditor.setTool('circle');
        setActiveToolButton('circle');
    });
    document.getElementById('addLineButton').addEventListener('click', () => {
        canvasEditor.setTool('line');
        setActiveToolButton('line');
    });
    document.getElementById('clearCanvasButton').addEventListener('click', () => canvasEditor.clearCanvas());
    document.getElementById('pencilButton').addEventListener('click', () => canvasEditor.setTool('pencil'));
    document.getElementById('selectButton').addEventListener('click', () => canvasEditor.setTool('select'));
    document.getElementById('restoreButton').addEventListener('click', () => {
        const data = localStorage.getItem('shapes');
        if (data) {
            try {
                const shapes = JSON.parse(data);
                canvasEditor.shapes = shapes;
                canvasEditor.redraw();
            } catch (e) {
                alert('Ошибка восстановления фигур!');
            }
        } else {
            alert('Нет сохранённых фигур для восстановления.');
        }
    });

    function setActiveToolButton(tool) {
        document.getElementById('selectButton').classList.remove('active-tool');
        document.getElementById('pencilButton').classList.remove('active-tool');
        document.getElementById('addRectangleButton').classList.remove('active-tool');
        document.getElementById('addCircleButton').classList.remove('active-tool');
        document.getElementById('addLineButton').classList.remove('active-tool');
        if (tool === 'select') {
            document.getElementById('selectButton').classList.add('active-tool');
        } else if (tool === 'pencil') {
            document.getElementById('pencilButton').classList.add('active-tool');
        } else if (tool === 'rectangle') {
            document.getElementById('addRectangleButton').classList.add('active-tool');
        } else if (tool === 'circle') {
            document.getElementById('addCircleButton').classList.add('active-tool');
        } else if (tool === 'line') {
            document.getElementById('addLineButton').classList.add('active-tool');
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