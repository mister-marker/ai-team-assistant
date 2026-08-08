# Диагностика LLM, локального запуска и бесплатного deployment

## 1. Сначала разделяем три разных проблемы

В этом проекте легко смешать в одну причину три независимых слоя:

```text
AI coding agent → изменил ли он файлы?
Local application → запускаются ли frontend и backend?
LLM provider → принимает ли внешний API запрос и возвращает ли ответ?
```

Ответ модели в чате может содержать идеальный код, но это ещё не означает, что
файлы изменены. Локальный frontend может запускаться, но backend может не иметь
валидного `API_KEY`. Backend может работать, но provider может вернуть `401`,
`429`, `402`, `5xx` или timeout.

## 2. Как расследовать проблему по цепочке

Проверять нужно снизу вверх, чтобы не отлаживать UI, пока не доказан provider.

### Шаг 1. Файлы и окружение

```bash
pwd
find . -maxdepth 2 -type f ! -path './frontend/node_modules/*' ! -path './backend/venv/*' | sort
git status --short
git diff --check
```

Если Git ещё не инициализирован, проверить хотя бы timestamps и diff через редактор.
После создания безопасного baseline лучше использовать Git: агенту нужен
проверяемый checkpoint.

Никогда не выводить значение ключа:

```bash
test -n "$API_KEY" && echo 'API_KEY is set' || echo 'API_KEY is missing'
test -n "$BASE_URL" && echo 'BASE_URL is set' || echo 'BASE_URL is missing'
test -n "$MODEL_NAME" && echo 'MODEL_NAME is set' || echo 'MODEL_NAME is missing'
```

### Шаг 2. Backend без LLM

```bash
cd backend
uvicorn main:app --reload --port 8000
```

В другом терминале:

```bash
curl -i http://127.0.0.1:8000/docs
curl -i http://127.0.0.1:8000/history
curl -i -X POST http://127.0.0.1:8000/chat \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"   ","mode":"brainstormer"}'
```

Ожидается: `/docs` и `/history` отвечают `200`, пустой prompt отвечает `400`.
Если это не так, проблема не в TokenRouter и не в React.

### Шаг 3. Provider smoke-test

После подтверждения backend можно проверить OpenAI-compatible endpoint напрямую.
Команду выполнять только с переменными окружения, не вставляя ключ в shell history:

```bash
curl -sS -i "$BASE_URL/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H 'Content-Type: application/json' \
  -d "$(python - <<'PY'
import json
import os

print(json.dumps({
    'model': os.environ['MODEL_NAME'],
    'messages': [
        {'role': 'system', 'content': 'Answer briefly.'},
        {'role': 'user', 'content': 'Return the word OK.'},
    ],
    'max_tokens': 20,
}))
PY
)"
```

Ключ нельзя передавать в prompt, screenshot, issue или публичный log.

## 3. Карта ошибок

| Симптом | Вероятный слой | Что проверить |
|---|---|---|
| Aider написал код, но файлы не изменились | Edit protocol / agent | `git diff`, имена файлов, формат patch |
| `TS1484 KeyboardEvent` | TypeScript | `import type { KeyboardEvent }` |
| lint `set-state-in-effect` | React lifecycle | async effect, cancellation, state update после ответа |
| Browser CORS error | Frontend/backend boundary | origin frontend, CORS allowlist, URL API |
| `Failed to fetch` | Network/process | backend port, browser URL, proxy, Render cold start |
| HTTP 400 | Input contract | prompt и допустимый `mode` |
| HTTP 401/403 | Provider auth | API key, endpoint, model access |
| HTTP 402/429 | Quota/billing/rate limit | trial balance, provider limits, retry policy |
| HTTP 404 from provider | Model/endpoint | `BASE_URL`, `/v1`, model identifier |
| HTTP 5xx | Provider availability | provider status, retry with backoff |
| timeout | Network/provider | explicit timeout, latency, model load |
| empty answer | Response parsing | `choices`, `message.content`, provider schema |
| history disappeared | Process lifecycle | in-memory storage, restart, redeploy, multiple workers |

## 4. Что изменить в backend, чтобы ошибка была понятной

Целевой pipeline:

```text
request_id → validate → call provider with timeout → map provider error → log internal details → safe JSON response
```

В log допустимо записать:

- `request_id`;
- mode;
- model name без API key;
- provider status code;
- latency;
- классификацию ошибки.

Не стоит по умолчанию записывать полный prompt и полный provider response: там могут
быть персональные или коммерческие данные.

## 5. Mobile version

Для этого продукта отдельное мобильное приложение на первом этапе не нужно.
Правильная последовательность:

1. responsive web: grid/flex, breakpoint, ширина 320px;
2. touch-friendly buttons и textarea;
3. readable Markdown/code blocks с горизонтальным scroll только внутри code block;
4. safe-area и viewport meta;
5. затем PWA manifest/service worker, если нужен installable app.

React/Vite frontend, размещённый как static site, уже может быть mobile web app.
Нативный React Native проект добавит отдельный runtime и не помогает закрыть
основные проблемы текущего MVP.

## 6. Бесплатная схема deployment

Рекомендуемая схема:

```text
Vercel или Render Static Site: frontend
Render Free Web Service: FastAPI backend
TokenRouter/другой provider: LLM API
```

API key хранится только в environment variables backend. Frontend получает только
публичный URL backend.

### Render backend

Для обычного Render Web Service нужны repository, build command
`pip install -r requirements.txt` и start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Настройки:

- Root Directory: `backend` либо команды с `cd backend`;
- Environment: `BASE_URL`, `MODEL_NAME`, `API_KEY`;
- Health Check: `/health`;
- CORS: добавить точный публичный origin frontend.

### Render frontend

- Service type: Static Site;
- Root Directory: `frontend`;
- Build Command: `npm ci && npm run build`;
- Publish Directory: `dist`;
- `VITE_API_BASE_URL=https://<backend>.onrender.com`.

### Важные ограничения free tier

Free Render Web Service может уснуть после 15 минут без входящего трафика и
просыпаться примерно минуту; filesystem ephemeral, поэтому in-memory history
пропадёт после restart/redeploy. Это нормально для preview, но нельзя обещать
такой схеме production availability. Актуальные ограничения нужно сверять в
[Render Free docs](https://render.com/docs/free) и инструкции FastAPI в
[Render FastAPI docs](https://render.com/docs/deploy-fastapi).

Vercel удобно использовать для статического frontend. Backend лучше оставить на
Render, потому что текущий проект уже является FastAPI application, а не serverless
function. Ограничения Hobby и runtime следует проверять по
[Vercel limits](https://vercel.com/docs/limits).

## 7. Нужен ли Git для deployment

Для ручной локальной работы — нет. Для нормального Render/Vercel workflow — да,
обычно нужен GitHub/GitLab/Bitbucket repository. Это не означает, что нужно уже
сейчас публиковать незрелый код.

Безопасный порядок:

1. убрать ключ из history и отозвать его;
2. проверить `.gitignore`;
3. добавить README и baseline;
4. `git init` и первый локальный commit;
5. проверить `git diff --check`, build и lint;
6. создать private remote repository;
7. подключить deployment только после прохождения smoke-test.

