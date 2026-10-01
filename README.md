# AI Office для Claude Code и Claude Desktop

Подключает CRM AI Office (сделки, контакты, задачи и эпики, проекты,
продукты, офферы, кампании) к Claude по MCP — по ключу компании.

Что внутри:

| Путь | Для чего |
|---|---|
| `plugins/aio` | плагин Claude Code: MCP-сервер `aio`, навык `aio-crm`, команды `/aio:check`, `/aio:desktop` |
| `desktop/` | расширение Claude Desktop `aio.mcpb` (мост stdio → MCP AI Office) |
| `.claude-plugin/marketplace.json` | репозиторий сам является маркетплейсом плагинов |

## Ключ

Кабинет AI Office → **Настройки** → блок «Ключи MCP» → **Создать**. Отметьте
только нужные разделы. Ключ показывается один раз и привязан к одной компании
— `company_id` передавать не нужно.

## Claude Code

```
/plugin marketplace add llirikkcoder/aio-claude-plugin
/plugin install aio@aio
```

Claude Code спросит ключ (поле скрыто, ключ уходит в защищённое хранилище).
Сменить позже: `/plugin` → aio → Configure. Проверка: `/aio:check`.

Если AI Office у вас уже подключён вручную (`claude mcp add … ai-office` на тот
же адрес), Claude Code отключит сервер плагина как дубль и будет работать
ручное подключение. Чтобы ходить с ключом плагина — удалите ручное:
`claude mcp remove ai-office -s user`.

Без Claude проверить ключ и адрес:

```
AIO_KEY=<ключ> bash plugins/aio/scripts/check.sh
```

401 — ключ не принят, 404 — неверный адрес (путь `/mcp-http/mcp`, не короткий
`/mcp-http`), 403 — ключ другой компании.

## Claude Desktop

**Расширение (рекомендуется).** Скачайте готовый
[`aio.mcpb`](https://github.com/llirikkcoder/aio-claude-plugin/releases/latest/download/aio.mcpb)
из [релизов](https://github.com/llirikkcoder/aio-claude-plugin/releases) или
соберите сами: `cd desktop && npm install && npm run pack`.

Двойной клик по `aio.mcpb` → «Установить» → вставить ключ. Node на
компьютере не нужен: Desktop запускает расширение своим. Ключ хранится в
системной связке ключей.

**Вручную** (нужен Node.js) — в `claude_desktop_config.json`
(Settings → Developer → Edit Config):

```json
{
  "mcpServers": {
    "ai-office": {
      "command": "npx",
      "args": ["-y", "mcp-remote",
               "https://chic-nature-production-30ea.up.railway.app/mcp-http/mcp",
               "--header", "Authorization:Bearer ${AIO_KEY}"],
      "env": { "AIO_KEY": "<ключ MCP>" }
    }
  }
}
```

После правки полностью закройте Desktop (Cmd+Q) и откройте снова.

## Своё развёртывание AI Office

Адрес задаётся в настройке `host` и плагина, и расширения (по умолчанию —
продовый сервис). Путь `/mcp-http/mcp` добавляется сам.
