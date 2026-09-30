---
description: Проверить подключение к AI Office — ключ, компания, доступные разделы
allowed-tools: mcp__plugin_aio_aio__get_context, mcp__plugin_aio_aio__list_deals, mcp__plugin_aio_aio__list_tasks, mcp__plugin_aio_aio__list_contacts, mcp__plugin_aio_aio__list_products, mcp__plugin_aio_aio__list_people, mcp__ai-office__get_context, mcp__ai-office__list_deals, mcp__ai-office__list_tasks, mcp__ai-office__list_contacts, mcp__ai-office__list_products, mcp__ai-office__list_people
---

Проверь подключение плагина aio к AI Office и ответь коротко, по-русски.

1. Вызови `get_context` (сервер плагина `aio`; если AI Office подключён ещё и
   вручную как `ai-office`, Claude Code оставляет только ручной — тогда вызывай
   его и отметь в итоге, что работает ручное подключение, а ключ плагина не
   используется). Если инструмента нет ни там, ни там — сервер не поднялся. Скажи пользователю:
   - открыть `/mcp` и посмотреть статус сервера `plugin:aio:aio`;
   - если ключ не задан или неверный — `/plugin` → aio → Configure, вписать
     ключ из кабинета AI Office (Настройки → «Ключи MCP» → «Создать»);
   - для проверки без Claude:
     `AIO_KEY=<ключ> bash ${CLAUDE_PLUGIN_ROOT}/scripts/check.sh`
     (401 — ключ не принят, 404 — неверный адрес, 403 — ключ другой компании).
   На этом остановись.
2. Если ответил — назови компанию (`company_id_from_header`).
3. Пройди по разделам одним лёгким чтением на каждый, `limit=1`:
   `list_deals`, `list_tasks`, `list_contacts`, `list_products`, `list_people`.
   Ответ «has no access to '<раздел>'» — раздел закрыт у ключа, это не ошибка.
4. Итог — одна таблица: раздел → открыт / закрыт. Данные из ответов не
   пересказывай: проверяем связь, а не содержимое CRM.
