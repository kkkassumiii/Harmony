# Гармония с собой

Веб-приложение для психологической поддержки, самонаблюдения и личного развития.

## 📋 Описание проекта

**Гармония с собой** — это современное веб-приложение, которое помогает пользователям:
- Отслеживать эмоциональное состояние через дневник эмоций
- Вести журнал заметок и переживаний  
- Устанавливать и достигать личные цели
- Формировать полезные привычки
- Просматривать статистику и аналитику
- Получать персонализированные рекомендации

## 🛠 Технологический стек

### Фронтенд
- React 18+ с TypeScript
- Redux Toolkit для управления состоянием
- React Router для навигации
- Bootstrap 5 + SCSS
- Axios для HTTP запросов
- Chart.js для графиков

### Бэкенд
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT для аутентификации
- bcryptjs для хеширования паролей

### DevOps
- Docker & Docker Compose
- Git для контроля версий

## 🚀 Быстрый старт

### Требования
- Docker и Docker Compose
- Git
- Node.js 18+ (для локальной разработки)

### Установка и запуск

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd harmony

# Запустите проект с Docker
docker-compose up -d

# Инициализируйте БД (в отдельном терминале)
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

Приложение будет доступно:
- **Фронтенд**: http://localhost:3000
- **Бэкенд API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs

## 📁 Структура проекта

```
harmony/
├── backend/                    # Node.js + Express бэкенд
│   ├── src/
│   │   ├── index.ts           # Point of entry
│   │   ├── routes/            # API маршруты
│   │   ├── controllers/       # Бизнес-логика
│   │   ├── services/          # Сервисы
│   │   ├── models/            # Prisma модели
│   │   ├── middleware/        # Middleware
│   │   ├── utils/             # Утилиты
│   │   └── types/             # TypeScript типы
│   ├── prisma/
│   │   └── schema.prisma      # Schema БД
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                   # React + TypeScript фронтенд
│   ├── src/
│   │   ├── components/        # React компоненты
│   │   ├── pages/             # Страницы
│   │   ├── services/          # API клиент
│   │   ├── store/             # Redux store
│   │   ├── styles/            # SCSS стили
│   │   ├── types/             # TypeScript типы
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🔑 Основные функции

### Аутентификация
- Регистрация новых пользователей
- Вход в систему с помощью JWT
- Безопасное хранение паролей (bcrypt)
- Сессия пользователя

### Дневник эмоций
- Создание, редактирование, удаление записей
- Выбор эмоции и уровня настроения
- Добавление тегов и заметок
- Просмотр истории эмоций

### Цели и привычки
- Создание и отслеживание целей
- Добавление привычек
- Отметка выполнения
- Статистика прогресса

### Аналитика
- Графики эмоционального состояния
- Статистика целей и привычек
- История активности
- Отчеты за период

## 🔐 Безопасность

- ✅ JWT токены для авторизации
- ✅ Хеширование паролей с bcrypt
- ✅ Защита от SQL-инъекций (Prisma ORM)
- ✅ CORS настройки
- ✅ Валидация данных на сервере
- ✅ Экранирование пользовательского ввода

## 📊 Требования к БД

- 3НФ нормализация
- UUID для первичных ключей
- Внешние ключи с referential integrity
- Индексы для оптимизации
- Миграции для версионного контроля

## 🧪 Тестирование

```bash
# Backend тесты
docker-compose exec backend npm run test

# Frontend тесты
docker-compose exec frontend npm run test
```

## 📚 API Документация

Введите в браузер: http://localhost:8000/api/docs

Полная документация всех endpoints доступна через Swagger/OpenAPI.

### Примеры запросов

#### Регистрация
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

#### Вход
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "username",
  "password": "password123"
}
```

#### Добавить запись эмоции
```bash
POST /api/emotion-entries
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "emotionId": "uuid",
  "content": "Today was a good day",
  "moodLevel": 8,
  "tags": "positive, productive"
}
```

## Contributing

Читайте [CONTRIBUTING.md](./CONTRIBUTING.md) для информации о том, как внести вклад в проект.

## License

MIT

## Контакты

Для вопросов и предложений создавайте issues в репозитории.

---

**Начните путь к гармонии с собой прямо сейчас! 🌸**
