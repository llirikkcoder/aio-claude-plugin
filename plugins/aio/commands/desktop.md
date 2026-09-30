---
description: Подключить AI Office и к Claude Desktop — расширение .mcpb или блок для claude_desktop_config.json
---

Пользователь хочет пользоваться AI Office ещё и из Claude Desktop. Плагины
Claude Code в Desktop не работают, поэтому там отдельное подключение. Объясни
коротко, по-русски, два пути.

**Путь 1, рекомендуемый — расширение `aio.mcpb`.** Собирается из каталога
`desktop/` репозитория плагина (`npm install && npm run pack`), либо берётся
готовым файлом у того, кто его собрал. Двойной клик по файлу → Claude Desktop
предложит установить → спросит ключ MCP. Ключ хранится в системной связке
ключей, в файлах настроек его нет. Никаких `npx` и Node у пользователя не нужно:
Desktop запускает расширение своим встроенным Node.

**Путь 2 — вручную через файл настроек.** Нужен Node.js на компьютере.
Файл: Mac — `~/Library/Application Support/Claude/claude_desktop_config.json`,
Windows — `%APPDATA%\Claude\claude_desktop_config.json`
(Desktop: Settings → Developer → Edit Config). Добавить в `mcpServers`:

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

В `--header` нет пробела после двоеточия — это намеренно: на Windows пробел в
аргументе ломает передачу. После правки — полностью закрыть Desktop (Cmd+Q) и
открыть заново.

Ключ в чат не просить и не вписывать за пользователя: он вставляет его сам.
Если пользователь дал ключ — не повторяй его в ответе.

Проверка в Desktop: значок инструментов в поле ввода, среди них ai-office;
вопрос «покажи последние сделки» должен вернуть список.
