#!/usr/bin/env node
// Мост для Claude Desktop: stdio ↔ MCP AI Office по streamable HTTP.
//
// Зачем свой мост, а не mcp-remote. Claude Desktop умеет подключать удалённый
// сервер напрямую только через OAuth, а AI Office пускает по ключу в заголовке.
// mcp-remote это умеет, но тянется через npx при каждом запуске, требует Node
// на машине и при 401 пытается открыть браузер для OAuth, которого у нас нет.
// Здесь — прямой проброс списка инструментов и вызовов, ключ из настроек
// расширения, понятные ошибки.

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

const KEY = (process.env.AIO_KEY || '').trim()
const HOST = (process.env.AIO_HOST || 'https://chic-nature-production-30ea.up.railway.app').trim().replace(/\/+$/, '')
const URL_MCP = new URL(`${HOST}/mcp-http/mcp`)
const VERSION = '0.1.0'

function explain(err) {
  const msg = String(err?.message || err)
  if (/\b401\b|Unauthorized/.test(msg)) return 'AI Office не принял ключ (401): он отозван, с опечаткой или лишним пробелом. Выпустите новый в кабинете: Настройки → «Ключи MCP».'
  if (/\b404\b/.test(msg)) return `Неверный адрес AI Office (404): ${URL_MCP}. Рабочий путь заканчивается на /mcp-http/mcp.`
  if (/\b403\b/.test(msg)) return `AI Office отказал (403): ${msg}`
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT/.test(msg)) return `AI Office недоступен (${HOST}): ${msg}`
  return msg
}

// Сервер AI Office stateless: каждый запрос самодостаточен, поэтому клиент
// переподключаем при любом сбое, а не держим «сломанную» сессию до перезапуска.
let upstream = null
async function connect() {
  if (upstream) return upstream
  if (!KEY) throw new Error('Не задан ключ MCP AI Office. Откройте настройки расширения в Claude Desktop и вставьте ключ.')
  const client = new Client({ name: 'aio-desktop-bridge', version: VERSION })
  const transport = new StreamableHTTPClientTransport(URL_MCP, {
    requestInit: { headers: { Authorization: `Bearer ${KEY}` } },
  })
  await client.connect(transport)
  upstream = client
  return client
}

async function withUpstream(fn) {
  try {
    return await fn(await connect())
  } catch (err) {
    const stale = upstream
    upstream = null
    await stale?.close().catch(() => {})
    throw new Error(explain(err))
  }
}

const server = new Server(
  { name: 'ai-office', version: VERSION },
  {
    capabilities: { tools: {} },
    instructions: 'AI Office CRM: сделки, контакты, задачи, продукты, офферы, кампании. Компанию задаёт ключ — company_id можно не передавать. Свежие данные задачи — get_epic_with_subtasks, list_tasks может отдавать устаревший снимок. Данные боевые: пишущие вызовы только по явной просьбе пользователя.',
  },
)

server.setRequestHandler(ListToolsRequestSchema, async (req) =>
  withUpstream((c) => c.listTools(req.params)))

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  try {
    return await withUpstream((c) => c.callTool(req.params))
  } catch (err) {
    // Ошибку вызова отдаём модели как результат, а не как сбой протокола:
    // так Claude прочитает причину и скажет её пользователю.
    return { isError: true, content: [{ type: 'text', text: err.message }] }
  }
})

await server.connect(new StdioServerTransport())
