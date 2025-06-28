/**
 * Класс CanvasEditor предоставляет инструменты для рисования и редактирования фигур на canvas.
 * Позволяет добавлять, выделять, перемещать, изменять размер и удалять фигуры.
 */
export class CanvasEditor {
    /**
     * Создает экземпляр CanvasEditor и инициализирует canvas, события и начальные фигуры.
     * @param {string} canvasId - id элемента canvas в DOM
     */
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
        this.currentTool = 'select'; // Новый инструмент: select, pencil, ...
        this.#resizeCanvasToWrapper();
        // Теперь canvas.width и height актуальны!
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const margin = 40; // внутренний отступ для фигур
        // 6 зон для 6 фигур (2 ряда по 3 колонки)
        const zones = [
            { xMin: margin, xMax: canvasWidth / 3 - margin, yMin: margin, yMax: canvasHeight / 2 - margin },
            { xMin: canvasWidth / 3 + margin, xMax: 2 * canvasWidth / 3 - margin, yMin: margin, yMax: canvasHeight / 2 - margin },
            { xMin: 2 * canvasWidth / 3 + margin, xMax: canvasWidth - margin, yMin: margin, yMax: canvasHeight / 2 - margin },
            { xMin: margin, xMax: canvasWidth / 3 - margin, yMin: canvasHeight / 2 + margin, yMax: canvasHeight - margin },
            { xMin: canvasWidth / 3 + margin, xMax: 2 * canvasWidth / 3 - margin, yMin: canvasHeight / 2 + margin, yMax: canvasHeight - margin },
            { xMin: 2 * canvasWidth / 3 + margin, xMax: canvasWidth - margin, yMin: canvasHeight / 2 + margin, yMax: canvasHeight - margin }
        ];
        const getRandom = (min, max) => Math.random() * (max - min) + min;
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        this.shapes = [
            this.#createRectangle({
                x: getRandom(zones[0].xMin, zones[0].xMax - 120),
                y: getRandom(zones[0].yMin, zones[0].yMax - 100),
                width: getRandom(100, Math.min(180, zones[0].xMax - zones[0].xMin)),
                height: getRandom(80, Math.min(140, zones[0].yMax - zones[0].yMin)),
                color: colors[Math.floor(getRandom(0, colors.length))],
                strokeWidth: getRandom(2, 5)
            }),
            this.#createRectangle({
                x: getRandom(zones[1].xMin, zones[1].xMax - 120),
                y: getRandom(zones[1].yMin, zones[1].yMax - 100),
                width: getRandom(100, Math.min(180, zones[1].xMax - zones[1].xMin)),
                height: getRandom(80, Math.min(140, zones[1].yMax - zones[1].yMin)),
                color: colors[Math.floor(getRandom(0, colors.length))],
                strokeWidth: getRandom(2, 5)
            }),
            this.#createCircle({
                x: getRandom(zones[2].xMin + 60, zones[2].xMax - 60),
                y: getRandom(zones[2].yMin + 60, zones[2].yMax - 60),
                radius: getRandom(40, Math.min(80, (zones[2].xMax - zones[2].xMin) / 2, (zones[2].yMax - zones[2].yMin) / 2)),
                color: colors[Math.floor(getRandom(0, colors.length))],
                strokeWidth: getRandom(2, 5)
            }),
            this.#createCircle({
                x: getRandom(zones[3].xMin + 60, zones[3].xMax - 60),
                y: getRandom(zones[3].yMin + 60, zones[3].yMax - 60),
                radius: getRandom(40, Math.min(80, (zones[3].xMax - zones[3].xMin) / 2, (zones[3].yMax - zones[3].yMin) / 2)),
                color: colors[Math.floor(getRandom(0, colors.length))],
                strokeWidth: getRandom(2, 5)
            }),
            (() => {
                // Линия с произвольным углом в зоне 4
                const zone = zones[4];
                const cx = (zone.xMin + zone.xMax) / 2;
                const cy = (zone.yMin + zone.yMax) / 2;
                const length = getRandom(80, Math.min(zone.xMax - zone.xMin, zone.yMax - zone.yMin) - 20);
                const angle = getRandom(0, Math.PI * 2);
                const x1 = cx - Math.cos(angle) * length / 2;
                const y1 = cy - Math.sin(angle) * length / 2;
                const x2 = cx + Math.cos(angle) * length / 2;
                const y2 = cy + Math.sin(angle) * length / 2;
                return this.#createLine({ x1, y1, x2, y2, color: colors[Math.floor(getRandom(0, colors.length))], strokeWidth: getRandom(2, 5) });
            })(),
            (() => {
                // Линия с произвольным углом в зоне 5
                const zone = zones[5];
                const cx = (zone.xMin + zone.xMax) / 2;
                const cy = (zone.yMin + zone.yMax) / 2;
                const length = getRandom(80, Math.min(zone.xMax - zone.xMin, zone.yMax - zone.yMin) - 20);
                const angle = getRandom(0, Math.PI * 2);
                const x1 = cx - Math.cos(angle) * length / 2;
                const y1 = cy - Math.sin(angle) * length / 2;
                const x2 = cx + Math.cos(angle) * length / 2;
                const y2 = cy + Math.sin(angle) * length / 2;
                return this.#createLine({ x1, y1, x2, y2, color: colors[Math.floor(getRandom(0, colors.length))], strokeWidth: getRandom(2, 5) });
            })()
        ];
        window.addEventListener('resize', () => this.#resizeCanvasToWrapper());
        this.#attachEvents();
        this.#drawShapes();
    }

    /**
     * Добавляет новый прямоугольник на canvas.
     */
    addRectangle() {
        this.shapes.push(this.#createRectangle());
        this.#drawShapes();
    }

    /**
     * Добавляет новый круг на canvas.
     */
    addCircle() {
        this.shapes.push(this.#createCircle());
        this.#drawShapes();
    }

    /**
     * Добавляет новую линию на canvas.
     */
    addLine() {
        this.shapes.push(this.#createLine());
        this.#drawShapes();
    }

    /**
     * Очищает canvas, удаляя все фигуры.
     */
    clearCanvas() {
        this.shapes = [];
        this.#drawShapes();
    }

    /**
     * Добавляет случайную фигуру (прямоугольник, круг или линию) на canvas.
     */
    addRandomShape() {
        const types = ['rectangle', 'circle', 'line'];
        const type = types[Math.floor(Math.random() * types.length)];
        let newShape;
        if (type === 'rectangle') {
            newShape = this.#createRectangle();
        } else if (type === 'circle') {
            newShape = this.#createCircle();
        } else if (type === 'line') {
            newShape = this.#createLine();
        }
        this.shapes.push(newShape);
        this.#drawShapes();
    }

    /**
     * Устанавливает текущий инструмент (select, pencil и др.).
     * @param {string} toolName - Имя инструмента
     */
    setTool(toolName) {
        this.currentTool = toolName;
    }

    // === Приватные методы ===
    /**
     * Рисует одну фигуру на canvas.
     * @private
     * @param {Object} shape - Фигура для рисования
     */
    #drawShape(shape) {
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = (shape.type === 'pencil') ? shape.strokeWidth * 2 : shape.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        switch (shape.type) {
            case 'rectangle': {
                const {x: cx, y: cy} = this.#getRectangleCenter(shape);
                ctx.translate(cx, cy);
                ctx.rotate(this.#getRectangleRotation(shape));
                ctx.strokeRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
                break;
            }
            case 'circle': {
                const {x: cx, y: cy} = this.#getCircleCenter(shape);
                ctx.arc(cx, cy, shape.radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
            }
            case 'line': {
                const {x: cx, y: cy} = this.#getLineCenter(shape);
                ctx.moveTo(shape.x1, shape.y1);
                ctx.lineTo(shape.x2, shape.y2);
                ctx.stroke();
                break;
            }
            case 'pencil': {
                if (shape.points && shape.points.length > 1) {
                    const simplified = this.#simplifyDouglasPeucker(shape.points, 1.5);
                    const beziers = this.#catmullRom2bezier(simplified);
                    if (beziers.length > 0) {
                        ctx.moveTo(beziers[0].start.x, beziers[0].start.y);
                        for (const seg of beziers) {
                            ctx.bezierCurveTo(seg.cp1.x, seg.cp1.y, seg.cp2.x, seg.cp2.y, seg.end.x, seg.end.y);
                        }
                        ctx.stroke();
                    }
                }
                break;
            }
            default:
                break;
        }
        ctx.restore();
    }

    /**
     * Рисует выделение и управляющие ручки для фигуры.
     * @private
     * @param {Object} shape - Фигура для выделения
     */
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
            const {x: cx, y: cy} = this.#getRectangleCenter(shape);
            ctx.translate(cx, cy);
            ctx.rotate(this.#getRectangleRotation(shape));
            // Заливка
            ctx.fillRect(-shape.width/2 - offset, -shape.height/2 - offset, shape.width + offset*2, shape.height + offset*2);
            // Рамка
            ctx.strokeRect(-shape.width/2 - offset, -shape.height/2 - offset, shape.width + offset*2, shape.height + offset*2);
            // Ручки
            ctx.fillStyle = borderColor;
            this.#getRectangleHandles(shape, offset).forEach((h) => ctx.fillRect(h.x - 4, h.y - 4, 8, 8));
            // Ручка вращения (кружок)
            const rotateHandle = {x: 0, y: -shape.height/2 - offset - 30, type: 'rotate'};
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
        } else if (shape.type === 'pencil') {
            // Bounding box + 8 ручек
            ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
            ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            ctx.fillStyle = borderColor;
            this.#getPencilHandles(bounds).forEach((h) => ctx.fillRect(h.x - 4, h.y - 4, 8, 8));
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
                {x: bounds.x - offset, y: bounds.y - offset, type: 'nw'},
                {x: bounds.x + bounds.width + offset, y: bounds.y - offset, type: 'ne'},
                {x: bounds.x + bounds.width + offset, y: bounds.y + bounds.height + offset, type: 'se'},
                {x: bounds.x - offset, y: bounds.y + bounds.height + offset, type: 'sw'},
                {x: bounds.x + bounds.width/2, y: bounds.y - offset, type: 'n'},
                {x: bounds.x + bounds.width + offset, y: bounds.y + bounds.height/2, type: 'e'},
                {x: bounds.x + bounds.width/2, y: bounds.y + bounds.height + offset, type: 's'},
                {x: bounds.x - offset, y: bounds.y + bounds.height/2, type: 'w'}
            ];

            handles.forEach((h) => ctx.fillRect(h.x - 4, h.y - 4, 8, 8));
        }

        ctx.restore();
    }

    /**
     * Перерисовывает все фигуры на canvas.
     * @private
     */
    #drawShapes() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!Array.isArray(this.shapes)) return;
        this.shapes.forEach(shape => {
            this.#drawShape(shape);
            this.#drawSelection(shape);
        });
    }

    /**
     * Публичный метод для перерисовки фигур
     */
    redraw() {
        this.#drawShapes();
    }

    /**
     * Получает координаты мыши относительно canvas.
     * @private
     * @param {MouseEvent} e
     * @returns {{x: number, y: number}}
     */
    #getMousePos(e) {
        return { x: e.offsetX, y: e.offsetY };
    }

    /**
     * Возвращает ограничивающий прямоугольник для фигуры.
     * @private
     * @param {Object} shape
     * @returns {{x: number, y: number, width: number, height: number}}
     */
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
            case 'pencil': {
                if (!shape.points || shape.points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
                let minX = shape.points[0].x, maxX = shape.points[0].x;
                let minY = shape.points[0].y, maxY = shape.points[0].y;
                for (const pt of shape.points) {
                    if (pt.x < minX) minX = pt.x;
                    if (pt.x > maxX) maxX = pt.x;
                    if (pt.y < minY) minY = pt.y;
                    if (pt.y > maxY) maxY = pt.y;
                }
                const offset = 5;
                return { x: minX - offset, y: minY - offset, width: (maxX - minX) + offset * 2, height: (maxY - minY) + offset * 2 };
            }
        }
    }

    /**
     * Проверяет, находится ли точка (x, y) внутри фигуры.
     * @private
     * @param {number} x
     * @param {number} y
     * @param {Object} shape
     * @returns {boolean}
     */
    #isPointInShape(x, y, shape) {
        const bounds = this.#getShapeBounds(shape);
        switch (shape.type) {
            case 'circle': {
                const dx = x - shape.x, dy = y - shape.y;
                return dx * dx + dy * dy <= shape.radius * shape.radius;
            }
            case 'line': {
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
            case 'rectangle': {
                const cx = shape.x + shape.width/2;
                const cy = shape.y + shape.height/2;
                const angle = -(shape.rotation ?? 0);
                const dx = x - cx, dy = y - cy;
                const lx = Math.cos(angle)*dx - Math.sin(angle)*dy;
                const ly = Math.sin(angle)*dx + Math.cos(angle)*dy;
                return lx >= -shape.width/2 && lx <= shape.width/2 && ly >= -shape.height/2 && ly <= shape.height/2;
            }
            case 'pencil': {
                if (!shape.points || shape.points.length < 2) return false;
                for (let i = 1; i < shape.points.length; i++) {
                    const xStart = shape.points[i-1].x, yStart = shape.points[i-1].y;
                    const xEnd = shape.points[i].x, yEnd = shape.points[i].y;
                    const dxToStart = x - xStart;
                    const dyToStart = y - yStart;
                    const segmentDx = xEnd - xStart;
                    const segmentDy = yEnd - yStart;
                    const projection = dxToStart * segmentDx + dyToStart * segmentDy;
                    const segmentLengthSq = segmentDx * segmentDx + segmentDy * segmentDy;
                    let t = segmentLengthSq ? projection / segmentLengthSq : -1;
                    t = Math.max(0, Math.min(1, t));
                    const closestX = xStart + t * segmentDx;
                    const closestY = yStart + t * segmentDy;
                    const dist = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
                    if (dist < 8) return true;
                }
                return false;
            }
            default:
                return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
        }
    }

    /**
     * Проверяет, наведена ли мышь на управляющую ручку фигуры.
     * @private
     * @param {number} x
     * @param {number} y
     * @param {Object} shape
     * @returns {Object|null} - Объект ручки или null
     */
    #getHandleAt(x, y, shape) {
        if (!shape.selected) return null;
        switch (shape.type) {
            case 'line': {
                if (Math.abs(x - shape.x1) <= 8 && Math.abs(y - shape.y1) <= 8) return {type: 'start'};
                if (Math.abs(x - shape.x2) <= 8 && Math.abs(y - shape.y2) <= 8) return {type: 'end'};
                return null;
            }
            case 'rectangle': {
                const cx = shape.x + shape.width/2;
                const cy = shape.y + shape.height/2;
                const offset = 5;
                const angle = -(shape.rotation ?? 0);
                const dx = x - cx, dy = y - cy;
                const lx = Math.cos(angle)*dx - Math.sin(angle)*dy;
                const ly = Math.sin(angle)*dx + Math.cos(angle)*dy;
                for (const h of this.#getRectangleHandles(shape, offset)) {
                    if (h.type === 'rotate') {
                        if ((lx-h.x)**2 + (ly-h.y)**2 <= 10*10) return {type: 'rotate'};
                    } else {
                        if (Math.abs(lx - h.x) <= 8 && Math.abs(ly - h.y) <= 8) return {type: h.type};
                    }
                }
                return null;
            }
            case 'circle': {
                const handleX = shape.x + shape.radius;
                const handleY = shape.y;
                if ((x - handleX) ** 2 + (y - handleY) ** 2 <= 10 * 10) {
                    return { type: 'radius' };
                }
                return null;
            }
            case 'pencil': {
                const bounds = this.#getShapeBounds(shape);
                for (const h of this.#getPencilHandles(bounds)) {
                    if (Math.abs(x - h.x) <= 8 && Math.abs(y - h.y) <= 8) return {type: h.type};
                }
                return null;
            }
            default: {
                const bounds = this.#getShapeBounds(shape);
                const offset = 5;
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
                return handles.find(h => Math.abs(x - h.x) <= 8 && Math.abs(y - h.y) <= 8) ?? null;
            }
        }
    }

    /**
     * Изменяет размер или другие параметры фигуры при перетаскивании ручки.
     * @private
     * @param {{x: number, y: number}} mouse - Текущая позиция мыши
     */
    #resizeShape(mouse) {
        const shape = this.interaction.selectedShape;
        const handle = this.interaction.resizeHandle;
        if (!shape || !handle) return;
        switch (shape.type) {
            case 'rectangle': {
                if (handle.type === 'rotate') {
                    const cx = shape.x + shape.width/2;
                    const cy = shape.y + shape.height/2;
                    const angle = Math.atan2(mouse.y - cy, mouse.x - cx);
                    if (this.interaction && this.interaction.initialAngle != null) {
                        shape.rotation = angle - this.interaction.initialAngle + (this.interaction.startRotation ?? 0);
                    } else {
                        shape.rotation = angle;
                    }
                    this.#drawShapes();
                    return;
                }
                if (handle.type) {
                    const offset = 5;
                    const cx = shape.x + shape.width/2;
                    const cy = shape.y + shape.height/2;
                    const angle = -(shape.rotation ?? 0);
                    const dx = mouse.x - cx, dy = mouse.y - cy;
                    const lx = Math.cos(angle)*dx - Math.sin(angle)*dy;
                    const ly = Math.sin(angle)*dx + Math.cos(angle)*dy;
                    let left = -shape.width/2, right = shape.width/2, top = -shape.height/2, bottom = shape.height/2;
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
                    const newWidth = right - left;
                    const newHeight = bottom - top;
                    const newCx = cx + (Math.cos(shape.rotation??0)*(left+right)/2 - Math.sin(shape.rotation ?? 0)*(top+bottom)/2);
                    const newCy = cy + (Math.sin(shape.rotation??0)*(left+right)/2 + Math.cos(shape.rotation ?? 0)*(top+bottom)/2);
                    shape.width = newWidth;
                    shape.height = newHeight;
                    shape.x = newCx - newWidth/2;
                    shape.y = newCy - newHeight/2;
                    this.#drawShapes();
                    return;
                }
                break;
            }
            case 'circle': {
                if (handle.type === 'radius') {
                    const dx = mouse.x - shape.x;
                    const dy = mouse.y - shape.y;
                    const newRadius = Math.sqrt(dx * dx + dy * dy);
                    shape.radius = Math.max(20, newRadius);
                    this.#drawShapes();
                    return;
                }
                break;
            }
            case 'line': {
                if (handle.type === 'start') {
                    shape.x1 = mouse.x;
                    shape.y1 = mouse.y;
                } else if (handle.type === 'end') {
                    shape.x2 = mouse.x;
                    shape.y2 = mouse.y;
                }
                this.#drawShapes();
                return;
            }
            case 'pencil': {
                if (this.interaction.pencilResize) {
                    const { initialPoints, initialBounds } = this.interaction.pencilResize;
                    let newX = initialBounds.x, newY = initialBounds.y, newW = initialBounds.width, newH = initialBounds.height;
                    switch (handle.type) {
                        case 'nw':
                            newX = mouse.x;
                            newY = mouse.y;
                            newW = initialBounds.x + initialBounds.width - mouse.x;
                            newH = initialBounds.y + initialBounds.height - mouse.y;
                            break;
                        case 'ne':
                            newY = mouse.y;
                            newW = mouse.x - initialBounds.x;
                            newH = initialBounds.y + initialBounds.height - mouse.y;
                            break;
                        case 'se':
                            newW = mouse.x - initialBounds.x;
                            newH = mouse.y - initialBounds.y;
                            break;
                        case 'sw':
                            newX = mouse.x;
                            newW = initialBounds.x + initialBounds.width - mouse.x;
                            newH = mouse.y - initialBounds.y;
                            break;
                        case 'n':
                            newY = mouse.y;
                            newH = initialBounds.y + initialBounds.height - mouse.y;
                            break;
                        case 's':
                            newH = mouse.y - initialBounds.y;
                            break;
                        case 'e':
                            newW = mouse.x - initialBounds.x;
                            break;
                        case 'w':
                            newX = mouse.x;
                            newW = initialBounds.x + initialBounds.width - mouse.x;
                            break;
                    }
                    newW = Math.max(10, newW);
                    newH = Math.max(10, newH);
                    shape.points = initialPoints.map(pt => {
                        const relX = (pt.x - initialBounds.x) / initialBounds.width;
                        const relY = (pt.y - initialBounds.y) / initialBounds.height;
                        return {
                            x: newX + relX * newW,
                            y: newY + relY * newH
                        };
                    });
                    this.#drawShapes();
                    return;
                }
                break;
            }
            default:
                break;
        }
        this.#drawShapes();
    }

    /**
     * Подключает обработчики событий мыши к canvas.
     * @private
     */
    #attachEvents() {
        this.canvas.addEventListener('mousedown', this.#onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.#onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.#onMouseUp.bind(this));
        // Для карандаша поддержим mouseleave (завершение линии при выходе мыши)
        this.canvas.addEventListener('mouseleave', this.#onMouseUp.bind(this));
    }

    /**
     * Обработчик события mousedown на canvas.
     * @private
     * @param {MouseEvent} e
     */
    #onMouseDown(e) {
        const mouse = this.#getMousePos(e);
        if (this.currentTool === 'pencil') {
            // Начинаем новую линию
            const newShape = {
                type: 'pencil',
                color: this.#getRandomColor(),
                strokeWidth: this.#getRandomStrokeWidth(),
                selected: false,
                points: [mouse]
            };
            this.shapes.push(newShape);
            this.interaction = {
                ...this.interaction,
                isDrawingPencil: true,
                drawingShape: newShape
            };
            this.#drawShapes();
            return;
        }
        // --- Новый код для прямоугольника ---
        if (this.currentTool === 'rectangle') {
            const newShape = this.#createRectangle({
                x: mouse.x,
                y: mouse.y,
                width: 1,
                height: 1
            });
            this.shapes.push(newShape);
            this.interaction = {
                ...this.interaction,
                isDrawingRectangle: true,
                drawingShape: newShape,
                startPoint: { ...mouse }
            };
            this.#drawShapes();
            return;
        }
        // --- Новый код для круга ---
        if (this.currentTool === 'circle') {
            const newShape = this.#createCircle({
                x: mouse.x,
                y: mouse.y,
                radius: 1
            });
            this.shapes.push(newShape);
            this.interaction = {
                ...this.interaction,
                isDrawingCircle: true,
                drawingShape: newShape,
                startPoint: { ...mouse }
            };
            this.#drawShapes();
            return;
        }
        // --- Новый код для линии ---
        if (this.currentTool === 'line') {
            const newShape = this.#createLine({
                x1: mouse.x,
                y1: mouse.y,
                x2: mouse.x,
                y2: mouse.y
            });
            this.shapes.push(newShape);
            this.interaction = {
                ...this.interaction,
                isDrawingLine: true,
                drawingShape: newShape,
                startPoint: { ...mouse }
            };
            this.#drawShapes();
            return;
        }

        for (const shape of this.shapes) {
            if (shape.selected) {
                const handle = this.#getHandleAt(mouse.x, mouse.y, shape);
                if (handle) {
                    let initialRadius = null;
                    let initialDistance = null;
                    let initialAngle = null;
                    let startRotation = null;
                    // --- pencil ---
                    let pencilResize = null;
                    if (shape.type === 'pencil') {
                        const bounds = this.#getShapeBounds(shape);
                        pencilResize = {
                            initialPoints: shape.points.map(pt => ({...pt})),
                            initialBounds: {...bounds}
                        };
                    }
                    if (shape.type === 'circle') {
                        initialRadius = shape.radius;
                        const dx = mouse.x - shape.x, dy = mouse.y - shape.y;
                        initialDistance = Math.sqrt(dx * dx + dy * dy);
                    }
                    if (shape.type === 'rectangle' && handle.type === 'rotate') {
                        const cx = shape.x + shape.width/2;
                        const cy = shape.y + shape.height/2;
                        initialAngle = Math.atan2(mouse.y - cy, mouse.x - cx);
                        startRotation = shape.rotation ?? 0;
                    }
                    this.interaction = { 
                        ...this.interaction, 
                        isResizing: true, 
                        selectedShape: shape, 
                        resizeHandle: handle,
                        initialRadius,
                        initialDistance,
                        initialAngle,
                        startRotation,
                        pencilResize
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
                } else if (shape.type === 'pencil') {
                    // Для карандашной линии сохраняем смещение для всех точек
                    this.interaction = {
                        isDragging: true,
                        selectedShape: shape,
                        dragOffset: { x: mouse.x, y: mouse.y },
                        initialPoints: shape.points.map(pt => ({...pt}))
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

    /**
     * Обработчик события mousemove на canvas.
     * @private
     * @param {MouseEvent} e
     */
    #onMouseMove(e) {
        const mouse = this.#getMousePos(e);
        let cursor = 'default';
        const drawingTools = ['rectangle', 'circle', 'line', 'pencil'];
        if (this.interaction.isDrawingPencil) {
            // Добавляем точку к текущей линии
            const shape = this.interaction.drawingShape;
            shape.points.push(mouse);
            this.#drawShapes();
            this.canvas.style.cursor = 'crosshair';
            return;
        }
        if (this.interaction.isDrawingRectangle) {
            const shape = this.interaction.drawingShape;
            const start = this.interaction.startPoint;
            shape.x = Math.min(start.x, mouse.x);
            shape.y = Math.min(start.y, mouse.y);
            shape.width = Math.abs(mouse.x - start.x);
            shape.height = Math.abs(mouse.y - start.y);
            this.#drawShapes();
            this.canvas.style.cursor = 'crosshair';
            return;
        }
        if (this.interaction.isDrawingCircle) {
            const shape = this.interaction.drawingShape;
            const start = this.interaction.startPoint;
            shape.radius = Math.sqrt((mouse.x - start.x) ** 2 + (mouse.y - start.y) ** 2);
            this.#drawShapes();
            this.canvas.style.cursor = 'crosshair';
            return;
        }
        if (this.interaction.isDrawingLine) {
            const shape = this.interaction.drawingShape;
            shape.x2 = mouse.x;
            shape.y2 = mouse.y;
            this.#drawShapes();
            this.canvas.style.cursor = 'crosshair';
            return;
        }
        if (this.interaction.isDragging) {
            const shape = this.interaction.selectedShape;
            if (shape.type === 'line') {
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
            } else if (shape.type === 'pencil') {
                const dx = mouse.x - this.interaction.dragOffset.x;
                const dy = mouse.y - this.interaction.dragOffset.y;
                shape.points = this.interaction.initialPoints.map(pt => ({
                    x: pt.x + dx,
                    y: pt.y + dy
                }));
            } else {
                shape.x = mouse.x - this.interaction.dragOffset.x;
                shape.y = mouse.y - this.interaction.dragOffset.y;
            }
            this.#drawShapes();
            cursor = 'move';
        } else if (this.interaction.isResizing) {
            this.#resizeShape(mouse);
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
        // --- FINAL cursor logic for drawing tools ---
        if (!this.interaction.isDragging && !this.interaction.isResizing && drawingTools.includes(this.currentTool)) {
            cursor = 'crosshair';
        }
        this.canvas.style.cursor = cursor;
    }

    /**
     * Обработчик события mouseup/mouseleave на canvas.
     * @private
     */
    #onMouseUp() {
        if (this.interaction.isDrawingPencil) {
            this.interaction = { ...this.interaction, isDrawingPencil: false, drawingShape: null };
        } else if (["isDrawingRectangle", "isDrawingCircle", "isDrawingLine"].some(key => this.interaction[key])) {
            this.interaction = { ...this.interaction, isDrawingRectangle: false, isDrawingCircle: false, isDrawingLine: false, drawingShape: null, startPoint: null };
        } else {
            this.interaction = { isDragging: false, isResizing: false, selectedShape: null, dragOffset: { x: 0, y: 0 }, resizeHandle: null };
        }
        this.#autoSave();
    }

    /**
     * Автоматически сохраняет фигуры в localStorage
     * @private
     */
    #autoSave() {
        try {
            localStorage.setItem('shapes', JSON.stringify(this.shapes));
        } catch (e) {
            console.warn('Ошибка автосохранения фигур:', e);
        }
    }

    /**
     * Возвращает CSS-курсор для типа ручки.
     * @private
     * @param {Object} handle
     * @returns {string}
     */
    #getCursorForHandle(handle) {
        if (!handle) return 'default';

        return CanvasEditor.handleCursorMap.get(handle.type) ?? 'default';
    }

    /**
     * Возвращает случайный цвет из палитры.
     * @private
     * @returns {string}
     */
    #getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];

        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Возвращает случайную толщину линии.
     * @private
     * @returns {number}
     */
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
        ['sw', 'nesw-resize'],
        ['start', 'pointer'],
        ['end', 'pointer'],
        ['rotate', 'grab'],
        ['radius', 'ew-resize']
    ]);

    // --- Catmull-Rom Spline to Bezier for smoothing pencil lines ---
    /**
     * Преобразует массив точек Catmull-Rom в сегменты Безье для сглаживания карандашных линий.
     * @private
     * @param {Array<{x: number, y: number}>} points
     * @returns {Array<Object>} - Сегменты Безье
     */
    #catmullRom2bezier(points) {
        if (points.length < 2) return [];
        const beziers = [];
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i - 1] || points[i];
            const p1 = points[i];
            const p2 = points[i + 1] || points[i];
            const p3 = points[i + 2] || p2;
            // Catmull-Rom to Bezier conversion
            const cp1 = {
                x: p1.x + (p2.x - p0.x) / 6,
                y: p1.y + (p2.y - p0.y) / 6
            };
            const cp2 = {
                x: p2.x - (p3.x - p1.x) / 6,
                y: p2.y - (p3.y - p1.y) / 6
            };
            beziers.push({
                start: { x: p1.x, y: p1.y },
                cp1,
                cp2,
                end: { x: p2.x, y: p2.y }
            });
        }
        return beziers;
    }

    // --- Douglas-Peucker simplification for points ---
    /**
     * Упрощает массив точек методом Дугласа-Пекера.
     * @private
     * @param {Array<{x: number, y: number}>} points
     * @param {number} epsilon - Порог чувствительности
     * @returns {Array<{x: number, y: number}>}
     */
    #simplifyDouglasPeucker(points, epsilon) {
        if (points.length < 3) return points;
        const dmax = { dist: 0, idx: 0 };
        const sq = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        function getPerpendicularDistance(pt, lineStart, lineEnd) {
            const dx = lineEnd.x - lineStart.x;
            const dy = lineEnd.y - lineStart.y;
            if (dx === 0 && dy === 0) return Math.sqrt(sq(pt, lineStart));
            const t = ((pt.x - lineStart.x) * dx + (pt.y - lineStart.y) * dy) / (dx * dx + dy * dy);
            const proj = { x: lineStart.x + t * dx, y: lineStart.y + t * dy };
            return Math.sqrt(sq(pt, proj));
        }
        for (let i = 1; i < points.length - 1; i++) {
            const d = getPerpendicularDistance(points[i], points[0], points[points.length - 1]);
            if (d > dmax.dist) {
                dmax.dist = d;
                dmax.idx = i;
            }
        }
        if (dmax.dist > epsilon) {
            const rec1 = this.#simplifyDouglasPeucker(points.slice(0, dmax.idx + 1), epsilon);
            const rec2 = this.#simplifyDouglasPeucker(points.slice(dmax.idx), epsilon);
            return rec1.slice(0, -1).concat(rec2);
        } else {
            return [points[0], points[points.length - 1]];
        }
    }

    /**
     * Создает объект прямоугольника с заданными или случайными параметрами.
     * @private
     * @param {Object} [options]
     * @returns {Object}
     */
    #createRectangle(options = {}) {
        return {
            type: 'rectangle',
            color: this.#getRandomColor(),
            strokeWidth: this.#getRandomStrokeWidth(),
            selected: false,
            x: options.x ?? (Math.random() * 600 + 50),
            y: options.y ?? (Math.random() * 400 + 50),
            width: options.width ?? (Math.random() * 150 + 100),
            height: options.height ?? (Math.random() * 100 + 80),
            rotation: options.rotation ?? 0
        };
    }

    /**
     * Создает объект круга с заданными или случайными параметрами.
     * @private
     * @param {Object} [options]
     * @returns {Object}
     */
    #createCircle(options = {}) {
        return {
            type: 'circle',
            color: this.#getRandomColor(),
            strokeWidth: this.#getRandomStrokeWidth(),
            selected: false,
            x: options.x ?? (Math.random() * 600 + 100),
            y: options.y ?? (Math.random() * 400 + 100),
            radius: options.radius ?? (Math.random() * 60 + 40)
        };
    }

    /**
     * Создает объект линии с заданными или случайными параметрами.
     * @private
     * @param {Object} [options]
     * @returns {Object}
     */
    #createLine(options = {}) {
        const x1 = options.x1 ?? (Math.random() * 600 + 100);
        const y1 = options.y1 ?? (Math.random() * 400 + 100);
        const angle = options.angle ?? (Math.random() * Math.PI * 2);
        const length = options.length ?? (Math.random() * 120 + 60);
        const x2 = options.x2 ?? (x1 + Math.cos(angle) * length);
        const y2 = options.y2 ?? (y1 + Math.sin(angle) * length);
        return {
            type: 'line',
            color: this.#getRandomColor(),
            strokeWidth: this.#getRandomStrokeWidth(),
            selected: false,
            x1, y1, x2, y2
        };
    }

    /**
     * Возвращает массив управляющих ручек для прямоугольника.
     * @private
     * @param {Object} shape
     * @param {number} [offset=5]
     * @returns {Array<Object>}
     */
    #getRectangleHandles(shape, offset = 5) {
        const w = shape.width, h = shape.height;
        return [
            {x: -w/2 - offset, y: -h/2 - offset, type: 'nw'},
            {x: +w/2 + offset, y: -h/2 - offset, type: 'ne'},
            {x: +w/2 + offset, y: +h/2 + offset, type: 'se'},
            {x: -w/2 - offset, y: +h/2 + offset, type: 'sw'},
            {x: 0, y: -h/2 - offset, type: 'n'},
            {x: +w/2 + offset, y: 0, type: 'e'},
            {x: 0, y: +h/2 + offset, type: 's'},
            {x: -w/2 - offset, y: 0, type: 'w'},
            {x: 0, y: -h/2 - offset - 30, type: 'rotate'}
        ];
    }

    /**
     * Возвращает массив управляющих ручек для карандашной линии.
     * @private
     * @param {Object} bounds
     * @returns {Array<Object>}
     */
    #getPencilHandles(bounds) {
        return [
            {x: bounds.x, y: bounds.y, type: 'nw'},
            {x: bounds.x + bounds.width, y: bounds.y, type: 'ne'},
            {x: bounds.x + bounds.width, y: bounds.y + bounds.height, type: 'se'},
            {x: bounds.x, y: bounds.y + bounds.height, type: 'sw'},
            {x: bounds.x + bounds.width/2, y: bounds.y, type: 'n'},
            {x: bounds.x + bounds.width, y: bounds.y + bounds.height/2, type: 'e'},
            {x: bounds.x + bounds.width/2, y: bounds.y + bounds.height, type: 's'},
            {x: bounds.x, y: bounds.y + bounds.height/2, type: 'w'}
        ];
    }

    // --- Вспомогательные методы для фигур ---
    /**
     * Возвращает центр прямоугольника.
     * @private
     * @param {Object} shape
     * @returns {{x: number, y: number}}
     */
    #getRectangleCenter(shape) {
        return {
            x: shape.x + shape.width / 2,
            y: shape.y + shape.height / 2
        };
    }

    /**
     * Возвращает угол поворота прямоугольника.
     * @private
     * @param {Object} shape
     * @returns {number}
     */
    #getRectangleRotation(shape) {
        return shape.rotation ?? 0;
    }

    /**
     * Возвращает центр круга.
     * @private
     * @param {Object} shape
     * @returns {{x: number, y: number}}
     */
    #getCircleCenter(shape) {
        return { x: shape.x, y: shape.y };
    }
    
    /**
     * Возвращает центр линии.
     * @private
     * @param {Object} shape
     * @returns {{x: number, y: number}}
     */
    #getLineCenter(shape) {
        return {
            x: (shape.x1 + shape.x2) / 2,
            y: (shape.y1 + shape.y2) / 2
        };
    }

    /**
     * Устанавливает размеры canvas по размеру .canvas-wrapper
     * @private
     */
    #resizeCanvasToWrapper() {
        const wrapper = this.canvas.parentElement;
        if (wrapper) {
            const rect = wrapper.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            this.#drawShapes();
        }
    }
} 