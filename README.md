# Draftly

## Описание (Русский)

**Draftly** — это простое и креативное веб-приложение для быстрого создания скетчей, визуализации идей и прототипирования. Приложение предоставляет интерактивный холст с инструментами для рисования фигур (прямоугольник, круг, линия, карандаш), выбора и перемещения объектов, а также поддерживает светлую и тёмную темы. Все изменения автоматически сохраняются в localStorage браузера.

### Основные возможности

- Рисование прямоугольников, кругов, линий и произвольных кривых (карандаш)
- Выделение и перемещение объектов
- Удаление выбранных объектов (клавиши Delete/Backspace)
- Очистка всего холста
- Переключение между светлой и тёмной темой
- Адаптивный интерфейс
- Автоматическое сохранение состояния холста в браузере
- Поддержка управления с клавиатуры (Escape — выделение, Delete — удаление)
- Поддержка сенсорных устройств (touch events)

### Технологии

- React 19
- TypeScript
- Vite
- roughjs (имитация рукописного стиля)
- SCSS (Sass)
- FontAwesome (иконки)
- Caddy (продакшн-сервер)
- pnpm (менеджер пакетов)

### Локальный запуск

1. Установите зависимости:

```bash
pnpm install
```

2. Запустите в режиме разработки:

```bash
pnpm dev
```

Приложение будет доступно по адресу: http://localhost:5173

3. Сборка для продакшена:

```bash
pnpm build
```

4. Предпросмотр продакшн-сборки:

```bash
pnpm preview
```

### Запуск через Docker

```bash
cd ci
docker-compose up --build
```

Приложение будет доступно по адресу: http://localhost:8080

---

# Draftly

## Description (English)

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

### Technologies

- React 19
- TypeScript
- Vite
- roughjs (hand-drawn style)
- SCSS (Sass)
- FontAwesome (icons)
- Caddy (production server)
- pnpm (package manager)

### Local Development

1. Install dependencies:

```bash
pnpm install
```

2. Start in development mode:

```bash
pnpm dev
```

The app will be available at: http://localhost:5173

3. Build for production:

```bash
pnpm build
```

4. Preview production build:

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