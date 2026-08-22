# service-desk

Внутренняя панель заявок сервисного центра. Ей пользуются менеджеры на приёмке:
видят входящие заявки, ведут их по статусам и переписываются по каждой.

Наружу панель не смотрит — только внутренняя сеть и вход по корпоративной учётке,
поэтому в `index.html` стоит `noindex`.

## Стек

- Angular 21, standalone-компоненты, новый control flow (`@if` / `@for`), zoneless.
- Сигналы в новом коде; в `core/api.service.ts` ещё живёт `BehaviorSubject` с первых версий.
- SCSS без фреймворков, переменные в `src/styles.scss`.

## Запуск

```bash
npm install
npm start          # дев-сервер на http://localhost:4200
npm run build
npm run lint
```

API отдаётся тем же доменом по относительным путям (`/api/requests`, `/api/users`),
на деве проксируется на стенд.

## Структура

```
src/app/
  core/           модели, сеть, текущий пользователь
  features/
    requests/     список заявок и карточка
    settings/     сотрудники (только для админа)
  shared/         пайпы
docs/
  conventions.md  как я тут пишу — правила проекта
```

## Правила

Договорённости по коду — в [docs/conventions.md](docs/conventions.md). Пишу их для себя:
проект живёт третий год, а решения забываются быстрее, чем кажется.

## Автоматическое ревью

Правила из `docs/conventions.md` переписаны в `.reviewgate/config.yml` — по ним проект проверяет
[ReviewGate](https://reviewgate.dev): быстрое ревью застейдженного на pre-commit (порог `blocker`)
и полное, с судьёй, перед push (порог `major`). Оба хука — в `.husky/`, ставятся вместе с
`npm install`. Сам бинарь — [reviewgate.dev/docs/agents](https://reviewgate.dev/docs/agents).

Схема моделей в конфиге — DeepSeek (`deepseek-v4-flash` ищет, `deepseek-v4-pro` судит), ключ — ваш,
в личном `~/.config/reviewgate/config.yml`. Ключ другого провайдера — объявите дома свою схему, она
заменяет командную целиком:

```yaml
# ~/.config/reviewgate/config.yml
llm:
  provider: anthropic
  api_key: sk-ant-...
  generators: [{ model: claude-sonnet-5 }]
  judges:     [{ model: claude-opus-5 }]
```

Агенту тоже ничего настраивать не надо: `.mcp.json` и две строки в `CLAUDE.md` уже в репозитории —
вставьте в чат «вызови get_team_rules и покажи, что вернулось». Кнопка «Позвонить клиенту» в ветке
`feat/call-button` написана агентом по этим правилам.

### Повторить ревью «задачи недели»

История репозитория — и есть сценарий: `before-search` (правила и хуки уже стоят) → поиск по заявкам
с грехами (`search-unreviewed`: коммит прошёл pre-commit, push остановил гейт) → правки по ревью
(`main`).

```bash
reviewgate doctor                         # провайдер отвечает, ключ принят
reviewgate rules                          # preset=angular, rules=8, gate=off
git checkout search-unreviewed
reviewgate review --refs before-search    # дифф фичи до правок — то, что судил pre-push
reviewgate review --refs before-search --fail-on major; echo "exit=$?"   # ровно это делает хук: 2 = push остановлен
```

То же на незакоммиченном, как в редакторе:

```bash
git checkout -b try before-search
git diff before-search search-unreviewed | git apply
reviewgate review                         # незакоммиченное, с судьёй
reviewgate review --staged --fast         # после git add — как на pre-commit
```
