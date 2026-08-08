# Reference design и соответствие стеку компании

## 1. Исходный материал

Локальный reference-файл: [ai-developer-intern.html](</Users/vladislavpoteryaev/Development/tz_aigma /ai-developer-intern.html:1>).

В HTML присутствуют ссылки на `./styles.css` и `./ai-developer-intern.js`, но в
локальной папке эти два файла отсутствуют. Поэтому ниже зафиксирована только
система, которую можно доказать по markup и структуре страницы. Точные цвета,
шрифты, animation timing и responsive breakpoints нужно снять из полной копии
CSS/JS или из browser inspector опубликованной страницы.

## 2. Что уже можно перенести

### Информационная архитектура

- верхний `topbar` с брендом и якорной навигацией;
- hero-блок с eyebrow, крупным headline, lead-текстом и двумя CTA;
- правый `hero-board` с карточками «Задача», «Принцип», «Формат»;
- секции с единым паттерном `section-copy` + контентная grid-зона;
- отдельные разделы для focus, functional, stack, materials и evaluation;
- динамические контейнеры `focus-grid`, `ai-functionality`, `stack-grid`, `score-grid`;
- фоновые декоративные `background-orb` без влияния на смысловой контент.

### UX-принципы

1. Сначала объяснить задачу и ценность, затем показать детали.
2. Давать короткие сканируемые блоки вместо длинной стены текста.
3. Разделять primary action и secondary exploration.
4. Использовать карточки как смысловые блоки, а не как декоративную сетку.
5. Делать структуру страницы предсказуемой через якоря и повторяемые section patterns.
6. Отделять базовый сценарий от бонусных возможностей.

## 3. Как применить стиль к AI Dashboard

Не нужно превращать рабочий dashboard в копию landing page. Нужно перенести язык
продукта:

```text
Reference landing → hierarchy, editorial cards, accent surfaces, narrative flow
AI dashboard       → same language + dense interaction area + operational states
```

### Целевая композиция dashboard

```text
Topbar: brand / current mode / health indicator
Hero: “Ask your team AI” + short explanation
Mode board: four role cards in the reference capability-grid style
Composer: prompt textarea + primary Ask AI action
Response board: Markdown answer + copy + metadata
History rail: last five exchange cards
Mobile: same order, one column, history below response
```

### Компонентное соответствие

| Reference page | Dashboard component | Responsibility |
|---|---|---|
| `topbar` | `AppHeader` | Brand, status, navigation |
| `hero-copy` | `AssistantHero` | Explain value and current role |
| `hero-board` | `ModeBoard` | Four role cards |
| `button-primary` | `AskButton` | Submit action |
| `board-card` | `ResponseCard` | Answer and metadata |
| `capability-grid` | `ModeSelector` | Select assistant persona |
| `flow-grid` | `RequestHistory` | Recent exchanges |
| `score-grid` | `Usage/quality panel` | Optional future metrics |

## 4. Рекомендуемый дизайн-слой

### Этап 1: стабилизировать текущий Vite MVP

Оставить React + TypeScript + Vite, закрыть build/lint и не делать миграцию ради
модного стека. Это минимизирует риск и сохраняет рабочий пользовательский поток.

### Этап 2: ввести стиль компании

- Tailwind CSS для layout и responsive rules;
- shadcn/ui как набор доступных примитивов, а не как готовый визуальный шаблон;
- собственные semantic tokens: `background`, `surface`, `ink`, `muted`, `accent`,
  `danger`, `focus-ring`;
- data-driven arrays для modes, history и score cards;
- CSS transitions только для hierarchy и state feedback;
- keyboard/focus/disabled states как часть компонента.

### Этап 3: Next.js по необходимости

Next.js нужен, если появляется landing/SEO, server-side rendering, публичные
страницы, auth boundaries или единый fullstack application. Для локального AI
dashboard Vite уже достаточен. Для обучения стеку компании можно сделать отдельную
ветку `feature/next-migration`, но не смешивать миграцию с исправлением текущих
ошибок.

## 5. Технический стиль компании в нашем учебном проекте

### AI integrations

LLM adapter должен быть заменяемым: TokenRouter, OpenAI, Claude-compatible provider
или mock provider для тестов. UI не должен знать детали конкретного провайдера.

### Internal services

Следующий уровень после MVP:

- auth boundary;
- user/team workspace;
- structured audit logs;
- saved conversations;
- dashboard metrics;
- provider usage and error statistics.

### n8n

n8n не нужно вставлять в основной request path на первом этапе. Его можно добавить
для асинхронных сценариев:

- отправить summary в Slack/Telegram;
- сформировать ежедневный digest;
- записать feedback в Airtable/Notion;
- уведомить о provider failure.

### DeepResearch

Использовать для исследования provider API, deployment limits, security practices
и конкурентных решений. Каждый research вывод должен превращаться в ссылку,
решение или эксперимент, а не оставаться длинным текстом.

### Figma → code

Перед реализацией компонента фиксировать:

- content hierarchy;
- states: default, hover, focus, loading, error, disabled;
- responsive behavior;
- spacing and semantic tokens;
- accessibility notes.

### Docker, Linux, CI/CD

После local quality gate:

```text
local build → Docker build → health check → preview deployment → smoke test
```

## 6. Design Definition of Done

- визуальная иерархия dashboard считывается за 5 секунд;
- primary action очевиден;
- четыре режима различаются не только цветом, но и текстом/назначением;
- loading/error/success states визуально согласованы;
- Markdown response не выглядит как сырая строка;
- mobile 320px не имеет горизонтального overflow;
- keyboard focus виден;
- contrast и button labels достаточны;
- CSS/design tokens не разбросаны случайными inline styles;
- визуальное изменение оформлено отдельным Git commit.

