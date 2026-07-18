# Anime Verse Shop

Большой Telegram Mini App-проект в современной аниме-стилистике. Главный модуль — магазин персонажей и одежды.

## Концепция

Пользователь выбирает парня или девушку, собирает образ и покупает одежду, причёски, аксессуары, оружие, питомцев и визуальные эффекты за внутриигровую валюту — **кроны**.

Визуальный стиль: нейтральный тёмно-синий фон, холодные голубые акценты, без фиолетовой детской палитры и без алмазов.

## Стек

- React + TypeScript + Vite
- React Router
- Lucide Icons
- FastAPI
- Telegram Mini Apps
- Vercel
- GitHub Actions

## Структура

```text
apps/
  web/                 React Mini App
  api/                 FastAPI backend
packages/              будущие общие пакеты
docs/                  документация продукта
.github/workflows/     CI
vercel.json            деплой frontend
```

## Локальный запуск

```bash
npm install
npm run dev
```

Приложение откроется на `http://localhost:5173`.

## Production build

```bash
npm run build
```

## Backend

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

На Windows активация окружения:

```powershell
.venv\Scripts\activate
```
