export class CanvasEditor {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.interaction = {
            isDragging: false,
            isResizing: false,
            selectedShape: null,
            dragOffset: { x: 0, y: 0 },
            resizeHandle: null
        };
        // Размеры канваса
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        // Функция для получения случайного значения в диапазоне
        const getRandom = (min, max) => Math.random() * (max - min) + min;
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        // Сектора для равномерного распределения
        const sectors = [
            { xMin: 0, xMax: canvasWidth / 2, yMin: 0, yMax: canvasHeight / 2 },
            { xMin: canvasWidth / 2, xMax: canvasWidth, yMin: 0, yMax: canvasHeight / 2 },
            { xMin: 0, xMax: canvasWidth / 2, yMin: canvasHeight / 2, yMax: canvasHeight },
            { xMin: canvasWidth / 2, xMax: canvasWidth, yMin: canvasHeight / 2, yMax: canvasHeight }
        ];
        // Прямоугольники
        this.shapes = [
            {
                type: 'rectangle',
                x: getRandom(sectors[0].xMin + 20, sectors[0].xMax - 120),
                y: getRandom(sectors[0].yMin + 20, sectors[0].yMax - 100),
                width: getRandom(100, 180),
                height: getRandom(80, 140),
                color: colors[Math.floor(getRandom(0, colors.length))],
                strokeWidth: getRandom(2, 5),
                selected: false,
                rotation: 0
            },
            {
                type: 'rectangle',
                x: getRandom(sectors[1].xMin + 20, sectors[1].xMax - 120),
                y: getRandom(sectors[1].yMin + 20, sectors[1].yMax - 100),
                width: getRandom(100, 180),
                height: getRandom(80, 140),
                color: colors[Math.floor(getRandom(0, colors.length))],
                strokeWidth: getRandom(2, 5),
                selected: false,
                rotation: 0
            },
            // Круги
            {
                type: 'circle',
                x: getRandom(sectors[2].xMin + 60, sectors[2].xMax - 60),
                y: getRandom(sectors[2].yMin + 60, sectors[2].yMax - 60),
                radius: getRandom(40, 80),
                color: colors[Math.floor(getRandom(0, colors.length))],
                strokeWidth: getRandom(2, 5),
                selected: false
            },
            {
                type: 'circle',
                x: getRandom(sectors[3].xMin + 60, sectors[3].xMax - 60),
                y: getRandom(sectors[3].yMin + 60, sectors[3].yMax - 60),
                radius: getRandom(40, 80),
                color: colors[Math.floor(getRandom(0, colors.length))],
                strokeWidth: getRandom(2, 5),
                selected: false
            },
            // Линии (разные сектора, но с перекрытием для большей равномерности)
            (() => {
                const x1 = getRandom(40, canvasWidth / 2 - 40), y1 = getRandom(40, canvasHeight / 2 - 40);
                const x2 = getRandom(canvasWidth / 2 + 40, canvasWidth - 40), y2 = getRandom(canvasHeight / 2 + 40, canvasHeight - 40);
                return {
                    type: 'line',
                    x1, y1, x2, y2,
                    color: colors[Math.floor(getRandom(0, colors.length))],
                    strokeWidth: getRandom(2, 5),
                    selected: false
                };
            })(),
            (() => {
                const x1 = getRandom(canvasWidth / 2 + 40, canvasWidth - 40), y1 = getRandom(40, canvasHeight / 2 - 40);
                const x2 = getRandom(40, canvasWidth / 2 - 40), y2 = getRandom(canvasHeight / 2 + 40, canvasHeight - 40);
                return {
                    type: 'line',
                    x1, y1, x2, y2,
                    color: colors[Math.floor(getRandom(0, colors.length))],
                    strokeWidth: getRandom(2, 5),
                    selected: false
                };
            })(),
            (() => {
                const x1 = getRandom(40, canvasWidth - 40), y1 = getRandom(40, canvasHeight - 40);
                const angle = getRandom(0, Math.PI * 2);
                const length = getRandom(80, 200);
                const x2 = x1 + Math.cos(angle) * length;
                const y2 = y1 + Math.sin(angle) * length;
                return {
                    type: 'line',
                    x1, y1, x2, y2,
                    color: colors[Math.floor(getRandom(0, colors.length))],
                    strokeWidth: getRandom(2, 5),
                    selected: false
                };
            })()
        ];
        this.#attachEvents();
        this.#drawShapes();
    }

    // === Публичные методы ===
    addRectangle() {
        const newShape = {
            type: 'rectangle',
            color: this.#getRandomColor(),
            strokeWidth: this.#getRandomStrokeWidth(),
            selected: false,
            x: Math.random() * 600 + 50,
            y: Math.random() * 400 + 50,
            width: Math.random() * 150 + 100,
            height: Math.random() * 100 + 80,
            rotation: 0
        };
        this.shapes.push(newShape);
        this.#drawShapes();
    }

    addCircle() {
        const newShape = {
            type: 'circle',
            color: this.#getRandomColor(),
            strokeWidth: this.#getRandomStrokeWidth(),
            selected: false,
            x: Math.random() * 600 + 100,
            y: Math.random() * 400 + 100,
            radius: Math.random() * 60 + 40
        };
        this.shapes.push(newShape);
        this.#drawShapes();
    }

    addLine() {
        const x1 = Math.random() * 600 + 100;
        const y1 = Math.random() * 400 + 100;
        const angle = Math.random() * Math.PI * 2;
        const length = Math.random() * 120 + 60;
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;
        const newShape = {
            type: 'line',
            color: this.#getRandomColor(),
            strokeWidth: this.#getRandomStrokeWidth(),
            selected: false,
            x1, y1, x2, y2
        };
        this.shapes.push(newShape);
        this.#drawShapes();
    }

    clearCanvas() {
        this.shapes = [];
        this.#drawShapes();
    }

    addRandomShape() {
        const types = ['rectangle', 'circle', 'line'];
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        const type = types[Math.floor(Math.random() * types.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        let newShape = { type, color, strokeWidth: Math.random() * 3 + 2, selected: false };
        if (type === 'rectangle') {
            Object.assign(newShape, { x: Math.random() * 600 + 50, y: Math.random() * 400 + 50, width: Math.random() * 150 + 100, height: Math.random() * 100 + 80 });
        } else if (type === 'circle') {
            Object.assign(newShape, { x: Math.random() * 600 + 100, y: Math.random() * 400 + 100, radius: Math.random() * 60 + 40 });
        } else if (type === 'line') {
            const x1 = Math.random() * 600 + 100;
            const y1 = Math.random() * 400 + 100;
            const angle = Math.random() * Math.PI * 2;
            const length = Math.random() * 120 + 60;
            const x2 = x1 + Math.cos(angle) * length;
            const y2 = y1 + Math.sin(angle) * length;
            Object.assign(newShape, { x1, y1, x2, y2 });
        }
        this.shapes.push(newShape);
        this.#drawShapes();
    }

    // === Приватные методы ===
    #drawShape(shape) {
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        if (shape.type === 'rectangle') {
            // Вращение
            const cx = shape.x + shape.width / 2;
            const cy = shape.y + shape.height / 2;
            ctx.translate(cx, cy);
            ctx.rotate((shape.rotation || 0));
            ctx.strokeRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
        } else if (shape.type === 'circle') {
            ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (shape.type === 'line') {
            ctx.moveTo(shape.x1, shape.y1);
            ctx.lineTo(shape.x2, shape.y2);
            ctx.stroke();
        }
        ctx.restore();
    }

    #drawSelection(shape) {
        if (!shape.selected) return;
        const ctx = this.ctx;
        const bounds = this.#getShapeBounds(shape);
        const offset = 5;
        ctx.save();
        // Цвета в стиле Excalidraw
        const borderColor = '#228be6'; // насыщенный синий
        const fillColor = 'rgba(34, 139, 230, 0.08)'; // полупрозрачная голубая
        ctx.lineWidth = 2;
        ctx.strokeStyle = borderColor;
        ctx.fillStyle = fillColor;
        ctx.setLineDash([]); // Сплошная линия
        if (shape.type === 'rectangle') {
            // Вращаем bounding box и ручки вместе с прямоугольником
            const cx = shape.x + shape.width / 2;
            const cy = shape.y + shape.height / 2;
            ctx.translate(cx, cy);
            ctx.rotate((shape.rotation || 0));
            // Заливка
            ctx.fillRect(-shape.width/2 - offset, -shape.height/2 - offset, shape.width + offset*2, shape.height + offset*2);
            // Рамка
            ctx.strokeRect(-shape.width/2 - offset, -shape.height/2 - offset, shape.width + offset*2, shape.height + offset*2);
            // Ручки
            ctx.fillStyle = borderColor;
            const w = shape.width, h = shape.height;
            const handles = [
                {x: -w/2 - offset, y: -h/2 - offset, type: 'nw'},
                {x: +w/2 + offset, y: -h/2 - offset, type: 'ne'},
                {x: +w/2 + offset, y: +h/2 + offset, type: 'se'},
                {x: -w/2 - offset, y: +h/2 + offset, type: 'sw'},
                {x: 0, y: -h/2 - offset, type: 'n'},
                {x: +w/2 + offset, y: 0, type: 'e'},
                {x: 0, y: +h/2 + offset, type: 's'},
                {x: -w/2 - offset, y: 0, type: 'w'},
                // вращение
                {x: 0, y: -h/2 - offset - 30, type: 'rotate'}
            ];
            handles.forEach((h) => ctx.fillRect(h.x - 4, h.y - 4, 8, 8));
            // Ручка вращения (кружок)
            const rotateHandle = {x: 0, y: -h/2 - offset - 30, type: 'rotate'};
            ctx.beginPath();
            ctx.arc(rotateHandle.x, rotateHandle.y, 8, 0, Math.PI*2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (shape.type === 'line') {
            // Не рисуем bounding box, только ручки
            ctx.fillStyle = borderColor;
            ctx.fillRect(shape.x1 - 4, shape.y1 - 4, 8, 8); // start
            ctx.fillRect(shape.x2 - 4, shape.y2 - 4, 8, 8); // end
        } else if (shape.type === 'circle') {
            // Заливка
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.radius + offset, 0, Math.PI * 2);
            ctx.fill();
            // Рамка
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.radius + offset, 0, Math.PI * 2);
            ctx.strokeStyle = borderColor;
            ctx.stroke();
            // Ручка справа от центра (на окружности)
            const handle = { x: shape.x + shape.radius, y: shape.y, type: 'radius' };
            ctx.beginPath();
            ctx.arc(handle.x, handle.y, 7, 0, Math.PI * 2);
            ctx.fillStyle = borderColor;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Для других фигур (если появятся)
            ctx.fillRect(
                bounds.x - offset,
                bounds.y - offset,
                bounds.width + offset * 2,
                bounds.height + offset * 2
            );
            ctx.strokeRect(
                bounds.x - offset,
                bounds.y - offset,
                bounds.width + offset * 2,
                bounds.height + offset * 2
            );
            ctx.fillStyle = borderColor;
            // 8 ручек: 4 угловые и 4 боковые
            const handles = [
                {x: bounds.x - offset, y: bounds.y - offset}, // nw
                {x: bounds.x + bounds.width + offset, y: bounds.y - offset}, // ne
                {x: bounds.x + bounds.width + offset, y: bounds.y + bounds.height + offset}, // se
                {x: bounds.x - offset, y: bounds.y + bounds.height + offset}, // sw
                {x: bounds.x + bounds.width/2, y: bounds.y - offset}, // n
                {x: bounds.x + bounds.width + offset, y: bounds.y + bounds.height/2}, // e
                {x: bounds.x + bounds.width/2, y: bounds.y + bounds.height + offset}, // s
                {x: bounds.x - offset, y: bounds.y + bounds.height/2, type: 'w'}
            ];
            handles.forEach((h) => ctx.fillRect(h.x - 4, h.y - 4, 8, 8));
        }
        ctx.restore();
    }

    #drawShapes() {
        console.log('drawShapes');
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.shapes.forEach(shape => {
            this.#drawShape(shape);
            this.#drawSelection(shape);
        });
    }

    #getMousePos(e) {
        return { x: e.offsetX, y: e.offsetY };
    }

    #getShapeBounds(shape) {
        switch(shape.type) {
            case 'rectangle': return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
            case 'circle': return { x: shape.x - shape.radius, y: shape.y - shape.radius, width: shape.radius * 2, height: shape.radius * 2 };
            case 'line': {
                const offset = 5;
                const minX = Math.min(shape.x1, shape.x2) - offset;
                const minY = Math.min(shape.y1, shape.y2) - offset;
                const maxX = Math.max(shape.x1, shape.x2) + offset;
                const maxY = Math.max(shape.y1, shape.y2) + offset;
                return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
            }
        }
    }

    #isPointInShape(x, y, shape) {
        const bounds = this.#getShapeBounds(shape);
        if (shape.type === 'circle') {
            const dx = x - shape.x, dy = y - shape.y;
            return dx * dx + dy * dy <= shape.radius * shape.radius;
        }
        if (shape.type === 'line') {
            // hit test: расстояние до линии < 8px
            const { x1, y1, x2, y2 } = shape;
            const dxToStart = x - x1;
            const dyToStart = y - y1;
            const lineDx = x2 - x1;
            const lineDy = y2 - y1;
            const projection = dxToStart * lineDx + dyToStart * lineDy;
            const lineLengthSq = lineDx * lineDx + lineDy * lineDy;
            let t = lineLengthSq ? projection / lineLengthSq : -1;
            t = Math.max(0, Math.min(1, t));
            const closestX = x1 + t * lineDx;
            const closestY = y1 + t * lineDy;
            const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
            return distance < 8;
        }
        if (shape.type === 'rectangle') {
            // Проверяем попадание с учётом поворота
            const cx = shape.x + shape.width/2;
            const cy = shape.y + shape.height/2;
            const angle = -(shape.rotation || 0);
            const dx = x - cx, dy = y - cy;
            const lx = Math.cos(angle)*dx - Math.sin(angle)*dy;
            const ly = Math.sin(angle)*dx + Math.cos(angle)*dy;
            return lx >= -shape.width/2 && lx <= shape.width/2 && ly >= -shape.height/2 && ly <= shape.height/2;
        }
        return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
    }

    #getHandleAt(x, y, shape) {
        if (!shape.selected) return null;
        if (shape.type === 'line') {
            // ручки только на концах
            if (Math.abs(x - shape.x1) <= 8 && Math.abs(y - shape.y1) <= 8) return {type: 'start'};
            if (Math.abs(x - shape.x2) <= 8 && Math.abs(y - shape.y2) <= 8) return {type: 'end'};
            return null;
        }
        if (shape.type === 'rectangle') {
            // Проверяем вращённые ручки
            const cx = shape.x + shape.width/2;
            const cy = shape.y + shape.height/2;
            const offset = 5;
            // Переводим (x, y) в локальные координаты прямоугольника
            const angle = -(shape.rotation || 0);
            const dx = x - cx, dy = y - cy;
            const lx = Math.cos(angle)*dx - Math.sin(angle)*dy;
            const ly = Math.sin(angle)*dx + Math.cos(angle)*dy;
            // 8 ручек
            const w = shape.width, h = shape.height;
            const handles = [
                {x: -w/2 - offset, y: -h/2 - offset, type: 'nw'},
                {x: +w/2 + offset, y: -h/2 - offset, type: 'ne'},
                {x: +w/2 + offset, y: +h/2 + offset, type: 'se'},
                {x: -w/2 - offset, y: +h/2 + offset, type: 'sw'},
                {x: 0, y: -h/2 - offset, type: 'n'},
                {x: +w/2 + offset, y: 0, type: 'e'},
                {x: 0, y: +h/2 + offset, type: 's'},
                {x: -w/2 - offset, y: 0, type: 'w'},
                // вращение
                {x: 0, y: -h/2 - offset - 30, type: 'rotate'}
            ];
            for (const h of handles) {
                if (h.type === 'rotate') {
                    if ((lx-h.x)**2 + (ly-h.y)**2 <= 10*10) return {type: 'rotate'};
                } else {
                    if (Math.abs(lx - h.x) <= 8 && Math.abs(ly - h.y) <= 8) return {type: h.type};
                }
            }
            return null;
        }
        if (shape.type === 'circle') {
            // Проверяем только одну ручку справа от центра
            const handleX = shape.x + shape.radius;
            const handleY = shape.y;
            if ((x - handleX) ** 2 + (y - handleY) ** 2 <= 10 * 10) {
                return { type: 'radius' };
            }
            return null;
        }
        const bounds = this.#getShapeBounds(shape);
        const offset = 5;
        // 8 ручек: 4 угловые и 4 боковые
        const handles = [
            {x: bounds.x - offset, y: bounds.y - offset, type: 'nw'},
            {x: bounds.x + bounds.width + offset, y: bounds.y - offset, type: 'ne'},
            {x: bounds.x + bounds.width + offset, y: bounds.y + bounds.height + offset, type: 'se'},
            {x: bounds.x - offset, y: bounds.y + bounds.height + offset, type: 'sw'},
            {x: bounds.x + bounds.width/2, y: bounds.y - offset, type: 'n'},
            {x: bounds.x + bounds.width + offset, y: bounds.y + bounds.height/2, type: 'e'},
            {x: bounds.x + bounds.width/2, y: bounds.y + bounds.height + offset, type: 's'},
            {x: bounds.x - offset, y: bounds.y + bounds.height/2, type: 'w'}
        ];
        return handles.find(h => Math.abs(x - h.x) <= 8 && Math.abs(y - h.y) <= 8) || null;
    }

    #resizeShape(shape, handle, mouse) {
        if (shape.type === 'rectangle' && handle.type === 'rotate') {
            // Вращение
            const cx = shape.x + shape.width/2;
            const cy = shape.y + shape.height/2;
            const angle = Math.atan2(mouse.y - cy, mouse.x - cx);
            if (this.interaction && this.interaction.initialAngle != null) {
                shape.rotation = angle - this.interaction.initialAngle + (this.interaction.startRotation || 0);
            } else {
                shape.rotation = angle;
            }
            this.#drawShapes();
            return;
        }
        if (shape.type === 'rectangle' && handle.type) {
            // --- Новый ресайз с учетом поворота ---
            const offset = 5;
            const cx = shape.x + shape.width/2;
            const cy = shape.y + shape.height/2;
            const angle = -(shape.rotation || 0);
            // Переводим мышь в локальные координаты
            const dx = mouse.x - cx, dy = mouse.y - cy;
            const lx = Math.cos(angle)*dx - Math.sin(angle)*dy;
            const ly = Math.sin(angle)*dx + Math.cos(angle)*dy;
            // Текущие локальные границы
            let left = -shape.width/2, right = shape.width/2, top = -shape.height/2, bottom = shape.height/2;
            // В зависимости от ручки меняем стороны
            switch (handle.type) {
                case 'nw':
                    left = Math.min(lx, right - 20);
                    top = Math.min(ly, bottom - 20);
                    break;
                case 'ne':
                    right = Math.max(lx, left + 20);
                    top = Math.min(ly, bottom - 20);
                    break;
                case 'se':
                    right = Math.max(lx, left + 20);
                    bottom = Math.max(ly, top + 20);
                    break;
                case 'sw':
                    left = Math.min(lx, right - 20);
                    bottom = Math.max(ly, top + 20);
                    break;
                case 'n':
                    top = Math.min(ly, bottom - 20);
                    break;
                case 's':
                    bottom = Math.max(ly, top + 20);
                    break;
                case 'e':
                    right = Math.max(lx, left + 20);
                    break;
                case 'w':
                    left = Math.min(lx, right - 20);
                    break;
            }
            // Новые размеры
            const newWidth = right - left;
            const newHeight = bottom - top;
            // Новый центр
            const newCx = cx + (Math.cos(shape.rotation||0)*(left+right)/2 - Math.sin(shape.rotation||0)*(top+bottom)/2);
            const newCy = cy + (Math.sin(shape.rotation||0)*(left+right)/2 + Math.cos(shape.rotation||0)*(top+bottom)/2);
            // Обновляем shape
            shape.width = newWidth;
            shape.height = newHeight;
            shape.x = newCx - newWidth/2;
            shape.y = newCy - newHeight/2;
            this.#drawShapes();
            return;
        }
        if (shape.type === 'circle' && handle.type === 'radius') {
            // Меняем радиус только если тянут за ручку
            const dx = mouse.x - shape.x;
            const dy = mouse.y - shape.y;
            const newRadius = Math.sqrt(dx * dx + dy * dy);
            shape.radius = Math.max(20, newRadius);
            this.#drawShapes();
            return;
        }
        switch (shape.type) {
            case 'rectangle':
                switch (handle.type) {
                    case 'se':
                        shape.width = Math.max(20, mouse.x - shape.x);
                        shape.height = Math.max(20, mouse.y - shape.y);
                        break;
                    case 'nw':
                        const newW_nw = Math.max(20, shape.x + shape.width - mouse.x);
                        const newH_nw = Math.max(20, shape.y + shape.height - mouse.y);
                        shape.x = shape.x + shape.width - newW_nw;
                        shape.y = shape.y + shape.height - newH_nw;
                        shape.width = newW_nw;
                        shape.height = newH_nw;
                        break;
                    case 'ne':
                        const newW_ne = Math.max(20, mouse.x - shape.x);
                        const newH_ne = Math.max(20, shape.y + shape.height - mouse.y);
                        shape.y = shape.y + shape.height - newH_ne;
                        shape.width = newW_ne;
                        shape.height = newH_ne;
                        break;
                    case 'sw':
                        const newW_sw = Math.max(20, shape.x + shape.width - mouse.x);
                        const newH_sw = Math.max(20, mouse.y - shape.y);
                        shape.x = shape.x + shape.width - newW_sw;
                        shape.width = newW_sw;
                        shape.height = newH_sw;
                        break;
                    case 'n':
                        const newH_n = Math.max(20, shape.y + shape.height - mouse.y);
                        shape.y = shape.y + shape.height - newH_n;
                        shape.height = newH_n;
                        break;
                    case 's':
                        shape.height = Math.max(20, mouse.y - shape.y);
                        break;
                    case 'e':
                        shape.width = Math.max(20, mouse.x - shape.x);
                        break;
                    case 'w':
                        const newW_w = Math.max(20, shape.x + shape.width - mouse.x);
                        shape.x = shape.x + shape.width - newW_w;
                        shape.width = newW_w;
                        break;
                }
                break;
            case 'circle':
                // Обычный ресайз больше не нужен, только через ручку
                break;
            case 'line':
                if (handle.type === 'start') {
                    shape.x1 = mouse.x;
                    shape.y1 = mouse.y;
                } else if (handle.type === 'end') {
                    shape.x2 = mouse.x;
                    shape.y2 = mouse.y;
                }
                break;
        }
        this.#drawShapes();
    }

    #attachEvents() {
        this.canvas.addEventListener('mousedown', this.#onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.#onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.#onMouseUp.bind(this));
    }

    #onMouseDown(e) {
        const mouse = this.#getMousePos(e);
        for (const shape of this.shapes) {
            if (shape.selected) {
                const handle = this.#getHandleAt(mouse.x, mouse.y, shape);
                if (handle) {
                    let initialRadius = null;
                    let initialDistance = null;
                    let initialAngle = null;
                    let startRotation = null;
                    if (shape.type === 'circle') {
                        initialRadius = shape.radius;
                        const dx = mouse.x - shape.x, dy = mouse.y - shape.y;
                        initialDistance = Math.sqrt(dx * dx + dy * dy);
                    }
                    if (shape.type === 'rectangle' && handle.type === 'rotate') {
                        const cx = shape.x + shape.width/2;
                        const cy = shape.y + shape.height/2;
                        initialAngle = Math.atan2(mouse.y - cy, mouse.x - cx);
                        startRotation = shape.rotation || 0;
                    }
                    this.interaction = { 
                        ...this.interaction, 
                        isResizing: true, 
                        selectedShape: shape, 
                        resizeHandle: handle,
                        initialRadius,
                        initialDistance,
                        initialAngle,
                        startRotation
                    };
                    return;
                }
            }
        }
        this.shapes.forEach(s => s.selected = false);
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            if (this.#isPointInShape(mouse.x, mouse.y, this.shapes[i])) {
                this.shapes[i].selected = true;
                const shape = this.shapes[i];
                if (shape.type === 'line') {
                    const centerX = (shape.x1 + shape.x2) / 2;
                    const centerY = (shape.y1 + shape.y2) / 2;
                    this.interaction = {
                        isDragging: true,
                        selectedShape: shape,
                        dragOffset: {
                            x: mouse.x - centerX,
                            y: mouse.y - centerY
                        },
                        lineCenter: { x: centerX, y: centerY }
                    };
                } else {
                    this.interaction = {
                        isDragging: true, selectedShape: shape,
                        dragOffset: {
                            x: mouse.x - shape.x,
                            y: mouse.y - shape.y
                        }
                    };
                }
                this.canvas.style.cursor = 'move';
                break;
            }
        }
        this.#drawShapes();
    }

    #onMouseMove(e) {
        const mouse = this.#getMousePos(e);
        let cursor = 'default';
        if (this.interaction.isDragging) {
            const shape = this.interaction.selectedShape;
            if (shape.type === 'line') {
                // Корректное перемещение линии
                const prevCenterX = (shape.x1 + shape.x2) / 2;
                const prevCenterY = (shape.y1 + shape.y2) / 2;
                const newCenterX = mouse.x - this.interaction.dragOffset.x;
                const newCenterY = mouse.y - this.interaction.dragOffset.y;
                const dx = newCenterX - prevCenterX;
                const dy = newCenterY - prevCenterY;
                shape.x1 += dx;
                shape.y1 += dy;
                shape.x2 += dx;
                shape.y2 += dy;
            } else {
                shape.x = mouse.x - this.interaction.dragOffset.x;
                shape.y = mouse.y - this.interaction.dragOffset.y;
            }
            this.#drawShapes();
            cursor = 'move';
        } else if (this.interaction.isResizing) {
            this.#resizeShape(this.interaction.selectedShape, this.interaction.resizeHandle, mouse);
            cursor = this.#getCursorForHandle(this.interaction.resizeHandle);
        } else {
            // Проверяем, наведена ли мышь на ручку
            let hoveredHandle = null;
            for (const shape of this.shapes) {
                if (shape.selected) {
                    hoveredHandle = this.#getHandleAt(mouse.x, mouse.y, shape);
                    if (hoveredHandle) break;
                }
            }
            if (hoveredHandle) {
                cursor = this.#getCursorForHandle(hoveredHandle);
            } else {
                // Проверяем, наведена ли мышь на выделенную фигуру
                let hoveredSelected = false;
                let hovered = false;
                for (let i = this.shapes.length - 1; i >= 0; i--) {
                    const shape = this.shapes[i];
                    if (this.#isPointInShape(mouse.x, mouse.y, shape)) {
                        hovered = true;
                        if (shape.selected) {
                            hoveredSelected = true;
                        }
                        break;
                    }
                }
                if (hoveredSelected) {
                    cursor = 'move';
                } else if (hovered) {
                    cursor = 'pointer';
                }
            }
        }
        this.canvas.style.cursor = cursor;
    }

    #onMouseUp() {
        this.interaction = { isDragging: false, isResizing: false, selectedShape: null, dragOffset: {x:0,y:0}, resizeHandle: null };
    }

    #getCursorForHandle(handle) {
        if (!handle) return 'default';
        if (handle.type === 'start' || handle.type === 'end') return 'pointer';
        if (handle.type === 'rotate') return 'grab';
        if (handle.type === 'radius') return 'ew-resize';
        return CanvasEditor.handleCursorMap.get(handle.type) || 'default';
    }

    #getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    #getRandomStrokeWidth() {
        return Math.random() * 3 + 2;
    }

    // === Статические поля ===
    static handleCursorMap = new Map([
        ['n', 'ns-resize'],
        ['s', 'ns-resize'],
        ['e', 'ew-resize'],
        ['w', 'ew-resize'],
        ['nw', 'nwse-resize'],
        ['se', 'nwse-resize'],
        ['ne', 'nesw-resize'],
        ['sw', 'nesw-resize']
    ]);
} 