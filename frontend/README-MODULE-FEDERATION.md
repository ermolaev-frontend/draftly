# Module Federation - Remote Configuration

Этот проект настроен как **remote** в системе Module Federation, что позволяет другим приложениям (host) импортировать и использовать основное приложение Draftly.

## Что экспортируется

### Основной компонент
- `./App` - Главный компонент приложения Draftly

## Как использовать в host приложении

### 1. Установка зависимостей
```bash
npm install @originjs/vite-plugin-federation
```

### 2. Конфигурация Vite в host приложении

#### Для разработки:
```typescript
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'host',
      remotes: {
        draftly: 'http://localhost:5173/assets/remoteEntry.js',
      },
      shared: {
        react: { requiredVersion: '^19.1.0' },
        'react-dom': { requiredVersion: '^19.1.0' },
      },
    }),
  ],
});
```

#### Для продакшена:
```typescript
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'host',
      remotes: {
        draftly: 'https://draftly.ermolaev-frontend.ru/assets/remoteEntry.js',
      },
      shared: {
        react: { requiredVersion: '^19.1.0' },
        'react-dom': { requiredVersion: '^19.1.0' },
      },
    }),
  ],
});
```

### 3. Импорт основного компонента
```typescript
import { lazy } from 'react';

const DraftlyApp = lazy(() => import('draftly/App'));
```

### 4. Использование в компонентах
```tsx
import React, { Suspense } from 'react';

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading Draftly...</div>}>
        <DraftlyApp />
      </Suspense>
    </div>
  );
}
```

## Сборка и развертывание

### Разработка
```bash
pnpm dev
```

### Продакшн сборка
```bash
pnpm build
```

После сборки в папке `dist` появится файл `remoteEntry.js`, который нужно разместить на сервере.

## Настройка для продакшена

### Текущая конфигурация:
- Базовый URL: `https://draftly.ermolaev-frontend.ru`
- Remote Entry: `https://draftly.ermolaev-frontend.ru/assets/remoteEntry.js`

### Для изменения URL:
Отредактируйте `vite.config.ts`:
```typescript
base: 'https://your-new-domain.com',
```

## Важные моменты

1. **Версии зависимостей**: Убедитесь, что версии React и React-DOM совпадают между host и remote приложениями.

2. **CORS**: При развертывании на разных доменах настройте CORS для доступа к `remoteEntry.js`.

3. **Типы TypeScript**: Для корректной работы типов в host приложении скопируйте файл `src/types/federation.d.ts`.

4. **URL в продакшене**: Всегда используйте абсолютные URL в продакшене, а не относительные пути.

## Структура файлов

```
frontend/
├── src/
│   └── types/
│       └── federation.d.ts    # Декларации типов для Module Federation
├── vite.config.ts             # Конфигурация с Module Federation
└── README-MODULE-FEDERATION.md
```

## Примеры использования

### Простой импорт
```tsx
import { CanvasWrapper } from 'draftly/App';

function MyApp() {
  return (
    <div>
      <h1>Мое приложение</h1>
      <DraftlyApp />
    </div>
  );
}
```

### Динамический импорт
```tsx
import { lazy, Suspense } from 'react';

const DraftlyApp = lazy(() => import('draftly/App'));

function App() {
  return (
    <Suspense fallback={<div>Загрузка Draftly...</div>}>
      <DraftlyApp />
    </Suspense>
  );
}
```
