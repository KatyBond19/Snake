Архитектура проекта «Multiplayer Snake»

## 1. Структура проекта

Проект — монорепозиторий с двумя рабочими проектами:

### apps/client — основное приложение (React + TypeScript + Vite)

Назначение: браузерный клиент мультиплеерной «Змейки».


apps/client/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
├── main.tsx — точка входа
├── App.tsx — корневой компонент, провайдер роутера
├── router.tsx — конфигурация маршрутов
├── pages/ — страницы приложения
│ ├── HomePage.tsx
│ ├── LobbyPage.tsx
│ ├── GamePage.tsx
│ └── NotFoundPage.tsx
└── components/ — компоненты приложения


### packages/shared-ui — библиотека общих компонентов

Назначение: переиспользуемые UI-компоненты, не зависящие от бизнес-логики.
packages/shared-ui/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
├── index.ts — публичный API библиотеки
├── Button.tsx — кнопка с вариантами primary/secondary
├── ScoreBoard.tsx — таблица лидеров
├── Button.test.tsx
└── ScoreBoard.test.tsx


## 2. Используемые библиотеки

| Библиотека            | Версия   | Назначение                              |
|-----------------------|----------|-----------------------------------------|
| react                 | ^18.3.1  | UI-фреймворк                            |
| react-dom             | ^18.3.1  | Рендеринг в DOM                         |
| react-router-dom      | ^6.26.1  | Клиентский роутинг                      |
| typescript            | ^5.5.4   | Типизация                               |
| vite                  | ^5.4.2   | Сборка и dev-сервер                     |
| vitest                | ^2.0.5   | Юнит-тесты                              |
| @testing-library/react| ^16.0.1  | Тестирование React-компонентов          |
| eslint                | ^8.57.0  | Линтинг                                 |

> UI-библиотека (material-ui и аналоги) не используется — компоненты собственные, что допустимо.


## 3. Компоненты

### packages/shared-ui
| Компонент     | Назначение                                      |
|---------------|-------------------------------------------------|
| `Button`      | Кнопка с вариантами `primary` / `secondary`     |
| `ScoreBoard`  | Таблица лидеров (сортировка по очкам)           |

### apps/client
| Компонент       | Назначение                                   |
|-----------------|----------------------------------------------|
| `GameCanvas`    | Игровое поле (canvas)                        |
| `HomePage`      | Главная страница                             |
| `LobbyPage`     | Лобби ожидания игроков                       |
| `GamePage`      | Страница игры                                |
| `NotFoundPage`  | Страница 404                                 |


## 4. Структура роутинга

| Маршрут            | Страница       | Параметры | Защита |
|--------------------|----------------|-----------|--------|
| `/`                | HomePage       | —         | нет    |
| `/lobby`           | LobbyPage      | —         | нет    |
| `/game/:roomId`    | GamePage       | `roomId`  | нет (в MVP) |
| `*`                | NotFoundPage   | —         | —      |

Вложенности нет: все маршруты плоские. Страница `/game/:roomId` использует параметр `roomId` для идентификации комнаты. Защищённые маршруты в MVP не предусмотрены (нет аутентификации).


## 5. Использование библиотеки shared-ui основным приложением

Основное приложение импортирует компоненты из `@snake/shared-ui`:

```tsx
import { Button, ScoreBoard } from '@snake/shared-ui'
Button используется на HomePage, LobbyPage, NotFoundPage.

ScoreBoard используется на GamePage.
Связь пакетов обеспечена через npm workspaces (поле workspaces в корневом package.json).

