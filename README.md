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
- `/teams` — рейтинг команд по Elo: место, изменение за 7 дней, форма W/L (`?all=1` показывает и неактивные команды)
- `/teams/:id` — карточка команды: график Elo по матчам, форма, состав
- `/match/:id` — ниже объяснения блок «Личные встречи и форма» (данные под признаками `h2h_diff` и `form5_diff`)
- `/results/upsets` — неожиданные результаты: уверенный фаворит модели проиграл (`?p=0.65|0.85` меняет порог)

Тёмная/светлая тема, переключатель в шапке. Токены дизайна — CSS-переменные в `src/styles/global.css`.

## Игроки, команды, трансферы
- `/players` рейтинг игроков (Team Impact Rating, `?hide=1` скрывает новичков), `/players/:id`, `/teams/:id`, `/transfers`.
- Слепки живого API лежат в `mocks/`. Для проверки состояний (пусто, ошибка 500, график с историей):
  `npm run mock`, затем `VITE_PROXY_TARGET=http://localhost:18081 npm run dev`; режим: `curl localhost:18081/__mode/ok|empty|error`.
  `player.sample-history.json` и `transfers.sample.json` составлены вручную (id 999001), не реальные данные.

## Проверка без бэкенда
`node mocks/make-samples.mjs` пересоздаёт синтетические моки для команд, личных встреч и сенсаций (id 9991xx, не реальные данные).
`MOCK_ONLY=1 node mocks/server.mjs`, затем `VITE_PROXY_TARGET=http://localhost:18081 npm run dev` — лента, рейтинг команд (`/teams`), команда с графиком (`/teams/9991007`), матч с личными встречами (`/match/999101`) и `/results/upsets` работают без Go и PostgreSQL.
