# PostgreSQL API (Admin)

Ниже краткая и практичная шпаргалка по новым admin-роутам для PostgreSQL.

## 1) Настройка окружения

В `.env.local`:

```env
POSTGRES_URL=postgresql://simon:bukbyak@81.163.27.100:5432/domik
```

Опционально:

```env
POSTGRES_ALLOWED_TABLES=table1,table2,table3
```

Если `POSTGRES_ALLOWED_TABLES` не задан, доступ по таблицам не ограничивается.

После изменения `.env.local` перезапусти dev-сервер.

---

## 2) Важно про доступ

Все роуты ниже находятся в `src/app/api/admin/postgres/...` и требуют админ-cookie (`admin_token`).

- без админ-доступа: `401`
- для публичной части сайта нужно делать отдельные `/api/public/...` роуты

---

## 3) Роуты

## A. Универсальный CRUD-конструктор

`/api/admin/postgres`  

### GET (список + total)

Параметры query:

- `table` (обязательно)
- `where` (JSON-строка, только равенства)
- `limit` (по умолчанию `100`)
- `offset` (по умолчанию `0`)
- `orderBy`
- `orderDir` (`asc` или `desc`)

Пример:

```js
const params = new URLSearchParams({
  table: 'feedbackRequests',
  where: JSON.stringify({ Type: 'birthday' }),
  limit: '25',
  offset: '0',
  orderBy: 'CreatedAt',
  orderDir: 'desc',
});

const res = await fetch(`/api/admin/postgres?${params.toString()}`);
const json = await res.json();
```

### POST (insert)

```js
await fetch('/api/admin/postgres', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    table: 'feedbackRequests',
    data: {
      Name: 'Иван',
      Phone: '+79990000000',
      Type: 'birthday',
    },
  }),
});
```

### PATCH (update)

```js
await fetch('/api/admin/postgres', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    table: 'feedbackRequests',
    data: { Phone: '+79991112233' },
    where: { id: 96 },
  }),
});
```

### DELETE

```js
await fetch('/api/admin/postgres', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    table: 'feedbackRequests',
    where: { id: 96 },
  }),
});
```

---

## B. Raw SELECT SQL

`/api/admin/postgres/raw-sql` (POST)

Для сложных чтений (`JOIN`, `GROUP BY`, `WITH`, и т.д.).

Ограничения:

- только `SELECT` / `WITH ... SELECT`
- только 1 statement (без `;`)
- без модификации данных

Пример:

```js
await fetch('/api/admin/postgres/raw-sql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql: `
      SELECT r.id, r."Name", t."Name" AS type_name
      FROM "feedbackRequests" r
      LEFT JOIN "feedbackRequestTypes" t ON t."Type" = r."Type"
      WHERE r."CreatedAt" >= $1
      ORDER BY r."CreatedAt" DESC
      LIMIT $2 OFFSET $3
    `,
    params: ['2026-01-01', 50, 0],
  }),
});
```

---

## C. Raw mutating SQL (INSERT/UPDATE/DELETE)

`/api/admin/postgres/exec` (POST)

Для полноценных изменяющих SQL-запросов.

Ограничения:

- только `INSERT` / `UPDATE` / `DELETE`
- только 1 statement (без `;`)
- `UPDATE/DELETE` без `WHERE` запрещены

Пример INSERT:

```js
await fetch('/api/admin/postgres/exec', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql: 'INSERT INTO online_transactions(amount, phone) VALUES ($1, $2) RETURNING *',
    params: [1500, '+79990000000'],
  }),
});
```

Пример UPDATE:

```js
await fetch('/api/admin/postgres/exec', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql: 'UPDATE online_transactions SET status = $1 WHERE id = $2 RETURNING *',
    params: ['succeeded', 96],
  }),
});
```

---

## 4) Правило безопасности (важно)

Никогда не подставляй значения через шаблонные строки:

```js
// ПЛОХО
`SELECT * FROM table WHERE amount > ${amount}`
```

Всегда используй placeholders и `params`:

```js
// ХОРОШО
sql: 'SELECT * FROM table WHERE amount > $1',
params: [amount]
```

