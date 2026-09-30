# Инструменты MCP AI Office

Снято с живого сервера 30.09.2026 (`tools/list`, 40 инструментов). `?` —
необязательный аргумент. `company_id?` везде можно опускать: подставится
компания ключа. В скобках — раздел, который должен быть открыт у ключа.

## Служебное

- `get_context()` — компания ключа (`company_id_from_header`), статусы сделок и задач
- `list_companies()` — компании (companies)
- `create_company(name, main_goal?, description?)` (companies)
- `flag_for_human(message, context?, urgency?)` — Telegram владельцу + задача с высоким приоритетом

## Сделки (deals)

- `list_deals(status?, stalled_days?, limit?)` — `stalled_days` — сделки без движения N дней
- `get_deal(deal_id)` — все поля и заметки
- `create_deal(contact_id?, service?, source?, potential_value?, notes?, status?, product_id?, probability?, blocker?, next_step?, due_date?)`
- `update_deal(deal_id, …те же поля…)` — **без статуса**
- `update_deal_status(deal_id, new_status, notes?)` — только так двигать по воронке

## Контакты (contacts)

- `list_contacts(query?, limit?)` — поиск по имени, телефону, почте
- `create_contact(name, phone?, email?, company_name?, telegram?, notes?)`
- `update_contact(contact_id, …)`

## Задачи и эпики (tasks)

- `list_tasks(status?, deal_id?, limit?)` — кандидаты; статусы могут быть устаревшими
- `list_epics(limit?)` — задачи верхнего уровня
- `get_epic_with_subtasks(epic_id)` — **свежие** данные: задача, подзадачи, комментарии; принимает номер (`"921"`) или UUID
- `create_task(title, description?, due_date?, priority?, project_id?, parent_task_id?, epic_type?, executor?, reviewer?, deal_id?, contact_request_id?)`
- `update_task_status(task_id, new_status)`
- `assign_task(task_id, executor?, reviewer?)` — имена из `list_people`
- `add_task_comment(task_id, text, user_id?)` — `user_id` — UUID из `list_people`
- `link_task_to_deal(task_id, contact_request_id?)` — без `contact_request_id` отвязывает

## Участники (people)

- `list_people()` — сотрудники и боты компании: имя, роль, UUID

## Проекты (projects)

- `list_projects(limit?)`, `create_project(name, description?)`, `update_project(project_id, name?, description?)`

## Продукты (products)

- `list_products(status?, product_type?, limit?)`
- `get_product(product_id)` — карточка со всеми полями (ценность, сценарии, возражения, КП…)
- `create_product(name, product_type, category, price_rub?, description?, short_description?, status?)`
- `update_product(product_id, …)` — ~45 полей карточки; смотреть схему инструмента
- `delete_product(product_id)` — архивирует

## Офферы и шаблоны рассылок (offers)

- `list_offers(template_type?, status?, limit?)`
- `create_offer(name, template_type?, channel?, subject?, body_html?, body_text?, description?, status?)`
- `update_offer(template_id, …)`
- `delete_offer(template_id)` — архивирует

## Кампании (campaigns)

- `list_campaigns(status?, limit?)`
- `create_campaign(name, template_id?, campaign_type?, scheduled_at?, description?)`
- `update_campaign(campaign_id, …)`
- `delete_campaign(campaign_id)` — **удаляет насовсем**

## Репозиторий (только внутренний ключ)

- `read_file`, `list_files`, `propose_changes` — ключ компании получает отказ
