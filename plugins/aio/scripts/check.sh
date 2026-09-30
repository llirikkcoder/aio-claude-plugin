#!/usr/bin/env bash
# Проверка подключения к MCP AI Office без Claude: адрес, ключ, список инструментов.
#
#   AIO_KEY=<ключ> bash check.sh [адрес]
#
# Ключ берётся только из переменной окружения, не из аргумента: аргументы
# видны в списке процессов и оседают в истории оболочки.
#
# Как читать ответ: 401 — не принят ключ, 404 — неверный путь (рабочий —
# /mcp-http/mcp, короткий /mcp-http не работает), 403 — ключ другой компании.
set -u

HOST="${1:-${AIO_HOST:-https://chic-nature-production-30ea.up.railway.app}}"
HOST="${HOST%/}"
URL="$HOST/mcp-http/mcp"

if [ -z "${AIO_KEY:-}" ]; then
  echo "Нет ключа: запустите как  AIO_KEY=<ключ> bash $0" >&2
  exit 2
fi

call() {
  curl -sS -o "$TMP" -w '%{http_code}' --max-time 30 "$URL" \
    -H "Authorization: Bearer $AIO_KEY" \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json, text/event-stream' \
    -d "$1"
}

# Ответ приходит либо JSON, либо одним событием SSE (data: {...}) со строками CRLF.
body() { tr -d '\r' < "$TMP" | sed -n 's/^data: //; /^{/p'; }

TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

echo "Адрес: $URL"
code=$(call '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"aio-check","version":"0.1.0"}}}')
case "$code" in
  200) echo "✓ сервер ответил, ключ принят" ;;
  401) echo "✗ 401 — ключ не принят: отозван, опечатка или лишний пробел"; exit 1 ;;
  403) echo "✗ 403 — $(cat "$TMP")"; exit 1 ;;
  404|307) echo "✗ $code — неверный адрес: нужен путь /mcp-http/mcp"; exit 1 ;;
  000) echo "✗ сервер недоступен: $HOST"; exit 1 ;;
  *) echo "✗ неожиданный ответ $code: $(head -c 300 "$TMP")"; exit 1 ;;
esac

code=$(call '{"jsonrpc":"2.0","id":2,"method":"tools/list"}')
if [ "$code" != 200 ]; then
  echo "✗ tools/list ответил $code: $(head -c 300 "$TMP")"; exit 1
fi
n=$(body | python3 -c 'import sys,json; print(len(json.load(sys.stdin)["result"]["tools"]))' 2>/dev/null)
echo "✓ инструментов: ${n:-?}"

code=$(call '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_context","arguments":{}}}')
cid=$(body | python3 -c '
import sys,json
r=json.load(sys.stdin)["result"]["content"][0]["text"]
print(json.loads(r).get("company_id_from_header"))' 2>/dev/null)
echo "✓ компания ключа: ${cid:-не определена}"
