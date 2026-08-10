// Заглушка API для локальной разработки: реальный бэкенд живёт в конторе,
// дома панель поднимается одной командой `npm start`.
// Данные в памяти, после перезапуска всё как было.
import { createServer } from 'node:http';

const users = [
  { id: 1, name: 'Марина Ковалёва', role: 'admin', isActive: true },
  { id: 2, name: 'Дмитрий Савин', role: 'manager', isActive: true },
  { id: 3, name: 'Оксана Литвин', role: 'manager', isActive: true },
  { id: 4, name: 'Павел Гущин', role: 'manager', isActive: false },
];

const requests = [
  { id: 101, number: 'SD-1041', clientName: 'Андрей Мельников', clientPhone: '+79161234501', subject: 'Не включается ноутбук после обновления', status: 'new', assigneeId: 2, createdAt: '2026-08-17T09:40:00Z', updatedAt: '2026-08-17T09:40:00Z' },
  { id: 102, number: 'SD-1040', clientName: 'Светлана Юдина', clientPhone: '+79031234502', subject: 'Замена экрана iPhone 14', status: 'in_progress', assigneeId: 2, createdAt: '2026-08-16T15:12:00Z', updatedAt: '2026-08-17T10:05:00Z' },
  { id: 103, number: 'SD-1039', clientName: 'Виктор Соловьёв', clientPhone: '+79261234503', subject: 'Чистка системы охлаждения', status: 'waiting', assigneeId: 3, createdAt: '2026-08-15T11:30:00Z', updatedAt: '2026-08-16T09:00:00Z' },
  { id: 104, number: 'SD-1038', clientName: 'Наталья Бирюкова', clientPhone: '+79151234504', subject: 'Пропал звук на планшете', status: 'in_progress', assigneeId: 3, createdAt: '2026-08-14T13:20:00Z', updatedAt: '2026-08-17T08:45:00Z' },
  { id: 105, number: 'SD-1037', clientName: 'Олег Черкасов', clientPhone: '+79991234505', subject: 'Диагностика после залития', status: 'new', assigneeId: null, createdAt: '2026-08-14T10:02:00Z', updatedAt: '2026-08-14T10:02:00Z' },
  { id: 106, number: 'SD-1036', clientName: 'Ирина Малахова', clientPhone: '+79051234506', subject: 'Не читается карта памяти', status: 'done', assigneeId: 2, createdAt: '2026-08-12T16:40:00Z', updatedAt: '2026-08-15T12:30:00Z' },
  { id: 107, number: 'SD-1035', clientName: 'Егор Ватутин', clientPhone: '+79671234507', subject: 'Апгрейд: SSD и память', status: 'done', assigneeId: 3, createdAt: '2026-08-11T09:15:00Z', updatedAt: '2026-08-13T17:20:00Z' },
  { id: 108, number: 'SD-1034', clientName: 'Тамара Гринёва', clientPhone: '+79781234508', subject: 'Кофе в клавиатуре, спасайте', status: 'rejected', assigneeId: null, createdAt: '2026-08-10T14:50:00Z', updatedAt: '2026-08-11T10:10:00Z' },
  { id: 109, number: 'SD-1033', clientName: 'Роман Аверин', clientPhone: '+79821234509', subject: 'Мигает подсветка матрицы', status: 'waiting', assigneeId: 2, createdAt: '2026-08-09T12:05:00Z', updatedAt: '2026-08-12T15:40:00Z' },
];

const comments = {
  101: [{ id: 1, requestId: 101, authorName: 'Дмитрий Савин', text: 'Позвонил, клиент привезёт ноутбук завтра к 11.', createdAt: '2026-08-17T10:20:00Z' }],
  103: [{ id: 2, requestId: 103, authorName: 'Оксана Литвин', text: 'Ждём подтверждение по цене от клиента.', createdAt: '2026-08-16T09:05:00Z' }],
};
let nextCommentId = 10;

const norm = (s) => (s ?? '').toString().toLowerCase();

const routes = (url, method, body) => {
  const u = new URL(url, 'http://x');
  const p = u.pathname;
  if (p === '/api/me') return users[0];
  if (p === '/api/users') return users;
  if (p === '/api/requests' && method === 'GET') return requests;
  if (p === '/api/requests/search') {
    const q = norm(u.searchParams.get('query'));
    const status = u.searchParams.get('status') ?? 'all';
    return requests.filter(
      (r) =>
        (status === 'all' || r.status === status) &&
        (!q || norm(r.number).includes(q) || norm(r.clientName).includes(q) || norm(r.subject).includes(q)),
    );
  }
  let m = p.match(/^\/api\/requests\/(\d+)\/comments$/);
  if (m) {
    const id = Number(m[1]);
    if (method === 'POST') {
      const c = { id: nextCommentId++, requestId: id, authorName: users[0].name, text: body.text, createdAt: new Date().toISOString() };
      (comments[id] ??= []).push(c);
      return c;
    }
    return comments[id] ?? [];
  }
  m = p.match(/^\/api\/requests\/(\d+)$/);
  if (m) {
    const r = requests.find((x) => x.id === Number(m[1]));
    if (!r) return null;
    if (method === 'PATCH') {
      r.status = body.status ?? r.status;
      r.updatedAt = new Date().toISOString();
    }
    return r;
  }
  return null;
};

const server = createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', () => {
    const body = raw ? JSON.parse(raw) : {};
    const data = routes(req.url, req.method, body);
    // Небольшая задержка, чтобы поведение было похоже на живую сеть.
    setTimeout(() => {
      if (data === null) {
        res.writeHead(404, { 'content-type': 'application/json' });
        res.end('{"error":"not found"}');
      } else {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(data));
      }
    }, 250);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('api: уже запущена на :3000 — вторую не поднимаю');
    process.exit(0);
  }
  throw err;
});

server.listen(3000, () => console.log('api-заглушка: http://localhost:3000'));
