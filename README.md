# Cyber Predict frontend

React + TypeScript + Vite. Читает данные из бэкенда (Go/Gin); документация лежит в `docs/frontend/` репозитория бэкенда (CONTRACT.md, DESIGN.md, types.ts).

```bash
npm install
npm run dev      # http://127.0.0.1:5173, /api и /health проксируются на http://localhost:18080
npm run build
```

Бэкенд: `docker compose up -d --build` в репозитории бэкенда (порт `PORT=18080` в его `.env`).
Прямые запросы без прокси: `VITE_API_URL=http://localhost:18080` и `CORS_ORIGIN=http://localhost:5173` у бэкенда (см. `.env.example`).

## Экраны
- `/` — лента матчей по дням, поиск и фильтры (в URL: `?q=&conf=&sort=`), раскрытие «Почему такой прогноз»
- `/match/:id` — карточка матча, объяснение, вклад признаков (SHAP)
- `/results` — точность в бою и сыгранные матчи
- `/about` — метрики модели, сравнение, калибровка (грузится лениво)

Тёмная/светлая тема, переключатель в шапке. Токены дизайна — CSS-переменные в `src/styles/global.css`.
