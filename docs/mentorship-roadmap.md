# Roadmap наставничества: Python-разработчик → AI Fullstack Engineer

Цель: научиться не просто просить AI «сделать проект», а управлять разработкой,
проверять результат и отвечать за архитектуру, безопасность и эксплуатацию.

## 1. Главный принцип

AI-агент — это ускоритель и pair programmer, но не владелец результата.

Инженер обязан сам определить:

1. что строим;
2. где границы задачи;
3. какие предположения сделаны;
4. как проверить результат;
5. что делать при ошибке;
6. какие риски нельзя принимать.

Правило рабочего цикла:

```text
Контекст → План → Маленькое изменение → Тест → Review → Checkpoint → Следующая задача
```

## 2. Технологическая карта

### Уровень A: инженерная база

- Git: status, diff, branch, commit, revert;
- shell и окружение: venv, npm, env variables, ports;
- HTTP: methods, status codes, JSON, CORS, timeout;
- typing: Pydantic, TypeScript unions, `type` imports;
- тестирование: unit, integration, smoke-test.

### Уровень B: backend

- FastAPI routes и dependency boundaries;
- Pydantic schemas и validation;
- service layer и adapter pattern;
- structured errors и logging;
- async I/O, timeout, retry, cancellation;
- in-memory versus persistent storage.

### Уровень C: frontend

- React state и component boundaries;
- controlled inputs и async UI states;
- TypeScript type safety;
- Markdown rendering и XSS boundary;
- responsive CSS, accessibility и mobile-first checks;
- API client и environment configuration.

### Уровень D: LLM engineering

- system/user messages и prompt boundaries;
- role prompts без ложного ощущения «магии»;
- structured output и schema validation;
- provider errors, rate limits и token budget;
- prompt injection и защита секретов;
- evaluation set: одинаковые вопросы для сравнения режимов.

### Уровень E: AI-assisted development

- контекст проекта без утечки секретов;
- bounded tasks вместо «сделай всё»;
- чтение diff, а не слепое принятие изменений;
- отдельный этап verification;
- работа с несколькими агентами по непересекающимся зонам;
- decision log: почему принято именно это решение.

### Уровень F: delivery

- Docker и production start command;
- environment variables в hosting;
- health checks и logs;
- free-tier limitations;
- rollback/checkpoint;
- публичная демонстрация без раскрытия ключей.

## 3. Как работать со мной

### Плохой запрос

```text
Сделай полностью рабочий AI dashboard, красиво и без ошибок.
```

Проблемы: нет границ, критериев, файлов, тестов и способа проверить результат.

### Хороший запрос на анализ

```text
Ты senior backend reviewer. Работаем только с backend/main.py.
Не меняй файлы. Проверь:
1) утечку exception details;
2) контракт ошибок;
3) конкурентность in-memory history;
4) тестируемость.
Дай findings с severity, доказательством и минимальным исправлением.
```

### Хороший запрос на реализацию

```text
Измени только backend/main.py и добавь tests/test_main.py.
Цель: безопасный error contract для POST /chat.
Ограничения: не раскрывать текст исключения, сохранить HTTP 400 для validation,
добавить request_id, не менять публичный success response без необходимости.
Сначала перечисли план, затем внеси изменения, затем запусти тесты и покажи diff.
```

### Хороший запрос на review

```text
Проверь реализацию как строгий reviewer.
Сначала выполни build/lint/tests.
Не исправляй код автоматически.
Отчёт: blocker, high, medium, low; для каждого — файл, строка, причина,
риск и минимальный fix.
```

## 4. Как работать с Aider/Codex и другими агентами

### До запуска агента

- убрать из контекста `.env`, токены и личные данные;
- дать `tree` проекта и только нужные файлы;
- описать критерии приёмки;
- ограничить область изменения;
- сохранить baseline или checkpoint.

### Во время работы

- один агент — одна связная задача;
- backend, frontend и документация могут делаться параллельно только при
  непересекающихся файлах;
- после каждой значимой итерации читать diff;
- не принимать фразы «готово» без команды проверки.

### После работы

```bash
git diff --check
python -m compileall backend
cd frontend && npm run build && npm run lint
```

Если проект ещё не в Git, это не запрет на checkpoints: сначала можно сохранять
копии и вести `docs/decision-log.md`, затем инициализировать локальный Git.

## 5. Почему Aider «выдал решение, но не файлы»

В истории видно два разных уровня:

1. Модель рассуждала и сформировала содержимое будущих файлов.
2. Aider ждал специальный edit/file format, но получил обычный текст с блоками
   кода без корректного имени файла.

В результате полезный текст ответа не равен изменению файлов. Это принципиальная
граница agentic coding:

```text
Модельный ответ ≠ применённый patch ≠ проверенный working software
```

Чтобы не повторять ситуацию:

- просить агента сначала анализировать, а потом применять маленький patch;
- проверять, что файлы реально изменились через `git diff`/`git status`;
- не использовать «whole project» prompt как единственную стратегию;
- после каждого patch запускать проверку;
- если формат Aider сломан, не копировать огромный ответ вручную без review.

## 6. План обучения на 8 недель

### Недели 1–2: fullstack foundation

Сделать API health/chat/history, понять HTTP, CORS, Pydantic, React state и TypeScript.
Результат: объяснить каждый endpoint и каждый state без подсказки AI.

### Недели 3–4: quality engineering

Добавить pytest, frontend quality gate, safe errors, logging, env configuration.
Результат: намеренно сломать provider и показать контролируемую ошибку.

### Недели 5–6: LLM engineering

Сравнить system prompts, добавить structured response или schema validation,
собрать 10–15 evaluation prompts для четырёх ролей.

### Недели 7–8: delivery

Docker, health check, mobile testing, free deployment, публичная демонстрация,
объяснение trade-offs и ограничений.

## 7. Еженедельный контроль наставника

На каждой встрече кандидат должен показать:

- что изменилось;
- какой риск был найден;
- какой тест доказывает исправление;
- что агент сделал автоматически;
- что кандидат проверил самостоятельно;
- какое решение он бы изменил при росте нагрузки.

Ключевой критерий роста: не количество сгенерированного кода, а качество
поставленного вопроса, проверки и инженерного объяснения.

## 8. Карта соответствия вакансии

| Задачи компании | Учебное продолжение этого проекта |
|---|---|
| Интеграции AI-агентов с корпоративными системами | LLM adapter, provider abstraction, n8n workflows |
| Авторизация и личные кабинеты | Auth boundary, workspace, user/team model |
| Логирование и мониторинг | Request id, structured logs, provider latency/errors |
| Дашборды и UI поверх AI | Reference design, mode board, response/history states |
| Лендинги из готовых блоков | Next.js, Tailwind, shadcn/ui, design tokens |
| Figma → код | Component states, responsive spec, visual QA |
| Deployment и домены | Docker, Render/Vercel, envs, health check, smoke test |
| CI/CD | GitHub Actions: lint, typecheck, tests, build |

Это не означает, что все технологии нужно добавить в текущий MVP одновременно.
Каждая следующая технология появляется только тогда, когда закрыта проблема,
которую она решает.

## 9. Обязательная практика Git через терминал

Я не буду создавать commits автоматически: цель — научиться самому видеть diff,
формулировать commit message и связывать изменение с требованием.

После удаления/отзыва старого ключа и проверки `.gitignore` выполнить вручную:

```bash
cd /Users/vladislavpoteryaev/Development/ai-dashbord
git init
git branch -M main
git add .gitignore README.md docs backend/.env.example
git commit -m "chore: establish project baseline"
```

Дальше каждая задача идёт отдельной веткой или маленьким commit:

```bash
git switch -c feature/reference-ui
# изменить только дизайн и компоненты UI
git diff --check
git add frontend docs/reference-design-and-stack.md
git commit -m "feat(ui): align dashboard with reference design"
```

Рекомендуемый порядок commit-ов:

1. `chore`: baseline и инструменты;
2. `docs`: ТЗ, roadmap, decision log;
3. `feat(ui)`: reference design и responsive layout;
4. `fix(frontend)`: build/lint/Markdown;
5. `feat(api)`: safe errors, config, history metadata;
6. `test`: backend/frontend quality gate;
7. `docs`: deployment и demo script.

Плохая практика: один commit «complete project» после нескольких часов
AI-генерации. Хорошая практика: каждый commit отвечает на вопрос «какое
требование он закрыл и чем это проверяется?».

## 10. Работа с контекстом, skills, sub-agents и MCP

Перед каждым AI-сеансом писать короткий context pack:

```text
Цель:
Файлы в scope:
Файлы вне scope:
Ограничения:
Acceptance criteria:
Команда проверки:
```

Роли инструментов:

- Codex/Claude Code — bounded implementation и review;
- отдельный sub-agent — независимый аудит API, UI или тестов;
- DeepResearch — внешние технические факты и сравнение провайдеров;
- MCP — безопасный доступ к разрешённым системам/данным по явному контракту;
- n8n — orchestration асинхронных интеграций, не замена core API;
- VS Code — diff, terminal, tests и ручное подтверждение результата.

Sub-agent не должен получать `.env`, API tokens и нерелевантную историю. Его
результат принимается только после проверки основным инженером.
