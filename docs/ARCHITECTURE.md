# Архитектура SAO

Проект разделён на независимые приложения и пакеты. Vercel собирает только `apps/web`, а FastAPI разворачивается отдельно на Render.

```text
SAO/
├── apps/
│   ├── web/                         # Telegram Mini App, React/Vite
│   │   ├── public/
│   │   │   ├── characters/
│   │   │   ├── cosmetics/
│   │   │   ├── icons/
│   │   │   ├── illustrations/
│   │   │   └── sounds/
│   │   └── src/
│   │       ├── app/                 # bootstrap, router, providers
│   │       ├── assets/
│   │       ├── components/
│   │       │   ├── feedback/
│   │       │   ├── layout/
│   │       │   ├── navigation/
│   │       │   └── ui/
│   │       ├── features/
│   │       │   ├── achievements/
│   │       │   ├── auth/
│   │       │   ├── character-creator/
│   │       │   ├── chat/
│   │       │   ├── checkout/
│   │       │   ├── cosmetics/
│   │       │   ├── currency/
│   │       │   ├── events/
│   │       │   ├── friends/
│   │       │   ├── guilds/
│   │       │   ├── inventory/
│   │       │   ├── marketplace/
│   │       │   ├── notifications/
│   │       │   ├── onboarding/
│   │       │   ├── profile/
│   │       │   ├── quests/
│   │       │   ├── shop/
│   │       │   ├── telegram/
│   │       │   └── wardrobe/
│   │       ├── hooks/
│   │       ├── lib/
│   │       ├── pages/
│   │       ├── services/
│   │       ├── store/
│   │       ├── styles/
│   │       ├── types/
│   │       └── utils/
│   └── api/                         # FastAPI API
│       └── app/
│           ├── api/v1/endpoints/
│           ├── core/
│           ├── db/
│           ├── models/
│           ├── repositories/
│           ├── schemas/
│           ├── services/
│           ├── tasks/
│           └── tests/
├── packages/
│   ├── config/
│   ├── shared-types/
│   └── ui-kit/
├── docs/
├── .github/workflows/
├── .vercelignore
└── vercel.json
```

## Правила модулей

Каждая крупная функция содержит `components`, `hooks`, `api`, `model`, `types` и публичный `index.ts`. Модули не импортируют внутренние файлы друг друга напрямую.

## Деплой

- Vercel: корень репозитория, команды берутся из `vercel.json`.
- Render: Root Directory `apps/api`, Start Command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
