# popovs:boilerplate — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать скилл `popovs:boilerplate` и публичный репо `popovs-boilerplate` с четырьмя рабочими шаблонами стеков, которые разворачиваются одной командой.

**Architecture:** Два репо: `popovs-boilerplate` (публичный, только шаблоны) + `ai-settings` (скилл). Скилл клонирует шаблонный репо, задаёт 4 вопроса, копирует файлы с подстановкой плейсхолдеров, копирует снэпшот AI-правил из ai-settings, генерирует DEPLOY.md, создаёт GitHub репо и делает начальный коммит.

**Tech Stack:** Next.js 15, FastAPI 0.115, Python 3.12, PostgreSQL 16, Docker Compose, MkDocs Material, GitHub CLI (`gh`), bash

---

## File Map

### Новый репо `popovs-boilerplate` (~/Desktop/projects/popovs-boilerplate/)

```
README.md
shared/
  .gitignore
  CHANGELOG.md
  TODO.md
  README.md                          ← плейсхолдеры
  docs/
    design/
      README.md
    superpowers/
      specs/.gitkeep
      plans/.gitkeep
nextjs-fastapi/
  meta.yaml
  .env.example
  nginx.conf
  docker-compose.yml
  docker-compose.prod.yml
  Makefile
  backend/
    app/
      __init__.py
      main.py
      config.py
      database.py
      api/__init__.py
      models/__init__.py
      schemas/__init__.py
      services/__init__.py
    migrations/init.sql
    tests/__init__.py
    requirements.txt
    Dockerfile
    pytest.ini
  frontend/
    src/app/
      layout.tsx
      page.tsx
      robots.ts
      sitemap.ts
    public/.gitkeep
    package.json
    tsconfig.json
    next.config.js
    Dockerfile
fastapi-only/
  meta.yaml
  .env.example
  docker-compose.yml
  app/
    __init__.py
    main.py
    config.py
    database.py
    api/__init__.py
    models/__init__.py
    schemas/__init__.py
    services/__init__.py
  migrations/init.sql
  tests/__init__.py
  requirements.txt
  Dockerfile
  pytest.ini
landing/
  meta.yaml
  index.html
  css/style.css
  js/main.js
  assets/images/.gitkeep
  robots.txt
  sitemap.xml
docs/
  meta.yaml
  mkdocs.yml
  requirements.txt
  content/
    index.md
    research/.gitkeep
    notes/.gitkeep
```

### Скилл в ai-settings

```
skills/popovs/boilerplate/
  SKILL.md
  README.md
  CHANGELOG.md
```

---

## Task 1: Создать репо popovs-boilerplate

**Files:**
- Create: `~/Desktop/projects/popovs-boilerplate/README.md`

- [ ] **Step 1: Создать директорию**

```bash
mkdir -p ~/Desktop/projects/popovs-boilerplate
cd ~/Desktop/projects/popovs-boilerplate
git init
```

- [ ] **Step 2: Создать README.md репо**

```bash
cat > README.md << 'EOF'
# popovs-boilerplate

Публичный репо шаблонов для скилла `popovs:boilerplate`.

## Стеки

| Папка | Описание |
|---|---|
| `nextjs-fastapi/` | Next.js 15 + FastAPI + PostgreSQL + Docker |
| `fastapi-only/` | FastAPI + PostgreSQL + Docker |
| `landing/` | Статический HTML/CSS/JS |
| `docs/` | Документация / ресёрч (MkDocs Material) |

## Использование

Этот репо используется автоматически скиллом `/popovs:boilerplate`.
Чтобы добавить новый стек — создать папку с `meta.yaml` и файлами шаблона.

## Структура стека

Каждый стек — папка с:
- `meta.yaml` — метаданные (name, description, tags)
- файлами шаблона с плейсхолдерами `{{PROJECT_NAME}}`, `{{DOMAIN}}`, `{{YEAR}}`
EOF
```

- [ ] **Step 3: Создать публичный репо на GitHub**

```bash
cd ~/Desktop/projects/popovs-boilerplate
gh repo create sergeypopov/popovs-boilerplate --public --source=. --remote=origin --description "Project templates for popovs:boilerplate skill"
```

Expected: репо создан на github.com/sergeypopov/popovs-boilerplate

---

## Task 2: Создать shared/

**Files:**
- Create: `~/Desktop/projects/popovs-boilerplate/shared/` (все файлы)

- [ ] **Step 1: Создать .gitignore**

```bash
mkdir -p ~/Desktop/projects/popovs-boilerplate/shared
cat > ~/Desktop/projects/popovs-boilerplate/shared/.gitignore << 'EOF'
# Python
__pycache__/
*.pyc
*.pyo
.venv/
.env
*.egg-info/
dist/
build/

# Node
node_modules/
.next/
.nuxt/
dist/
out/

# Env files
.env
.env.local
.env.production
.env.*.local

# Editor
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
.dockerignore

# Logs
*.log
logs/
EOF
```

- [ ] **Step 2: Создать CHANGELOG.md**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/shared/CHANGELOG.md << 'EOF'
# CHANGELOG

Формат: [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

## [Unreleased]
EOF
```

- [ ] **Step 3: Создать TODO.md**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/shared/TODO.md << 'EOF'
# TODO

## Активные задачи

## В очереди
EOF
```

- [ ] **Step 4: Создать README.md с плейсхолдерами**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/shared/README.md << 'EOF'
# {{PROJECT_NAME}}

## Локальный запуск

```bash
cp .env.example .env
make dev
```

Сервисы:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Docs: http://localhost:8000 (для docs-стека: mkdocs serve)

## Деплой

Полная инструкция — [`docs/DEPLOY.md`](docs/DEPLOY.md).

## Структура

```
docs/
  ai/           ← правила агента (снэпшот из ai-settings)
  design/       ← дизайн-спека и материалы
  superpowers/  ← планы и спеки от Claude
  DEPLOY.md     ← инструкция деплоя на VM
```
EOF
```

- [ ] **Step 5: Создать docs/design/README.md**

```bash
mkdir -p ~/Desktop/projects/popovs-boilerplate/shared/docs/design
cat > ~/Desktop/projects/popovs-boilerplate/shared/docs/design/README.md << 'EOF'
# Дизайн

Здесь живут материалы по дизайну: спека, мудборды, токены, референсы.

## Структура

- `spec.md` — дизайн-спецификация (создать когда будет визуальный дизайн)
- `tokens.md` — дизайн-токены: цвета, типографика, отступы
- `references/` — референсы и вдохновение
EOF
```

- [ ] **Step 6: Создать директории superpowers/**

```bash
mkdir -p ~/Desktop/projects/popovs-boilerplate/shared/docs/superpowers/specs
mkdir -p ~/Desktop/projects/popovs-boilerplate/shared/docs/superpowers/plans
touch ~/Desktop/projects/popovs-boilerplate/shared/docs/superpowers/specs/.gitkeep
touch ~/Desktop/projects/popovs-boilerplate/shared/docs/superpowers/plans/.gitkeep
```

---

## Task 3: Создать nextjs-fastapi/backend

**Files:**
- Create: `~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/` (все файлы)

- [ ] **Step 1: Создать структуру директорий**

```bash
mkdir -p ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/app/{api,models,schemas,services}
mkdir -p ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/{migrations,tests}
```

- [ ] **Step 2: Создать app/main.py**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/app/main.py << 'EOF'
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="{{PROJECT_NAME}}", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
EOF
```

- [ ] **Step 3: Создать app/config.py**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/app/config.py << 'EOF'
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = (
        "postgresql+asyncpg://postgres:postgres@db:5432/{{PROJECT_NAME}}"
    )

    class Config:
        env_file = ".env"


settings = Settings()
EOF
```

- [ ] **Step 4: Создать app/database.py**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/app/database.py << 'EOF'
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import settings

engine = create_async_engine(settings.database_url)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
EOF
```

- [ ] **Step 5: Создать __init__.py файлы**

```bash
touch ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/app/__init__.py
touch ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/app/api/__init__.py
touch ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/app/models/__init__.py
touch ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/app/schemas/__init__.py
touch ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/app/services/__init__.py
touch ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/tests/__init__.py
```

- [ ] **Step 6: Создать migrations/init.sql**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/migrations/init.sql << 'EOF'
-- Initial schema for {{PROJECT_NAME}}
-- Add your tables here
EOF
```

- [ ] **Step 7: Создать requirements.txt**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/requirements.txt << 'EOF'
fastapi==0.115.0
uvicorn[standard]==0.32.0
sqlalchemy==2.0.36
asyncpg==0.30.0
pydantic==2.9.2
pydantic-settings==2.6.1
alembic==1.14.0
pytest==8.3.3
pytest-asyncio==0.24.0
httpx==0.28.0
EOF
```

- [ ] **Step 8: Создать Dockerfile**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/Dockerfile << 'EOF'
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
EOF
```

- [ ] **Step 9: Создать pytest.ini**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/backend/pytest.ini << 'EOF'
[pytest]
asyncio_mode = auto
EOF
```

---

## Task 4: Создать nextjs-fastapi/frontend

**Files:**
- Create: `~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/frontend/` (все файлы)

- [ ] **Step 1: Создать структуру директорий**

```bash
mkdir -p ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/frontend/src/app
mkdir -p ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/frontend/public
touch ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/frontend/public/.gitkeep
```

- [ ] **Step 2: Создать src/app/layout.tsx**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/frontend/src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '{{PROJECT_NAME}}',
  description: '{{PROJECT_NAME}}',
  metadataBase: new URL('https://{{DOMAIN}}'),
  openGraph: {
    type: 'website',
    siteName: '{{PROJECT_NAME}}',
    locale: 'ru_RU',
    url: 'https://{{DOMAIN}}',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
EOF
```

- [ ] **Step 3: Создать src/app/page.tsx**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/frontend/src/app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main>
      <h1>{{PROJECT_NAME}}</h1>
    </main>
  )
}
EOF
```

- [ ] **Step 4: Создать src/app/robots.ts**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/frontend/src/app/robots.ts << 'EOF'
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://{{DOMAIN}}/sitemap.xml',
    host: 'https://{{DOMAIN}}',
  }
}
EOF
```

- [ ] **Step 5: Создать src/app/sitemap.ts**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/frontend/src/app/sitemap.ts << 'EOF'
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://{{DOMAIN}}',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
EOF
```

- [ ] **Step 6: Создать package.json**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/frontend/package.json << 'EOF'
{
  "name": "{{PROJECT_NAME}}-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
EOF
```

- [ ] **Step 7: Создать tsconfig.json**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/frontend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF
```

- [ ] **Step 8: Создать next.config.js**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/frontend/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
EOF
```

- [ ] **Step 9: Создать frontend/Dockerfile**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/frontend/Dockerfile << 'EOF'
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
EOF
```

---

## Task 5: Создать nextjs-fastapi/ корневые файлы

**Files:**
- Create: `meta.yaml`, `.env.example`, `nginx.conf`, `docker-compose.yml`, `docker-compose.prod.yml`, `Makefile`

- [ ] **Step 1: Создать meta.yaml**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/meta.yaml << 'EOF'
name: "Next.js + FastAPI"
description: "Full-stack: Next.js 15 frontend + FastAPI backend + PostgreSQL 16 + Docker Compose"
tags: [fullstack, nextjs, fastapi, postgres, docker]
EOF
```

- [ ] **Step 2: Создать .env.example**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/.env.example << 'EOF'
POSTGRES_USER={{PROJECT_NAME}}
POSTGRES_PASSWORD=changeme
POSTGRES_DB={{PROJECT_NAME}}
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
```

- [ ] **Step 3: Создать nginx.conf**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/nginx.conf << 'EOF'
server {
    listen 80;

    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
```

- [ ] **Step 4: Создать docker-compose.yml**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/docker-compose.yml << 'EOF'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-app}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@db:5432/${POSTGRES_DB:-app}
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:8000}
    depends_on:
      - backend
    ports:
      - "3000:3000"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
EOF
```

- [ ] **Step 5: Создать docker-compose.prod.yml**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/docker-compose.prod.yml << 'EOF'
services:
  backend:
    env_file: .env.production
    restart: unless-stopped
    networks:
      - web
      - default

  frontend:
    env_file: .env.production
    restart: unless-stopped
    environment:
      HOSTNAME: "0.0.0.0"
    networks:
      - web
      - default

networks:
  web:
    external: true
EOF
```

- [ ] **Step 6: Создать Makefile**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/Makefile << 'EOF'
.PHONY: dev down reset logs

dev:
	docker compose up --build

down:
	docker compose down

reset:
	docker compose down -v

logs:
	docker compose logs -f $(s)
EOF
```

---

## Task 6: Верификация nextjs-fastapi шаблона

> Проверяем что шаблон реально запускается. Тест ставим ПЕРЕД проверкой — если не проходит до fix, значит шаблон нерабочий.

**Files:** нет (только проверка)

- [ ] **Step 1: Создать временный тестовый проект**

```bash
mkdir -p /tmp/test-boilerplate
cp -r ~/Desktop/projects/popovs-boilerplate/nextjs-fastapi/. /tmp/test-boilerplate/
cp ~/Desktop/projects/popovs-boilerplate/shared/.gitignore /tmp/test-boilerplate/

# Подставить плейсхолдеры
find /tmp/test-boilerplate -type f \( -name "*.py" -o -name "*.tsx" -o -name "*.ts" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.conf" -o -name ".env.example" \) \
  -exec sed -i '' 's/{{PROJECT_NAME}}/testapp/g; s/{{DOMAIN}}/testapp.popovs.tech/g' {} \;

cp /tmp/test-boilerplate/.env.example /tmp/test-boilerplate/.env
```

- [ ] **Step 2: Запустить docker-compose (ожидаем 3 сервиса UP)**

```bash
cd /tmp/test-boilerplate
docker compose up -d --build
```

Expected: db, backend, frontend запустились без ошибок

- [ ] **Step 3: Проверить backend health**

```bash
sleep 10
curl -s http://localhost:8000/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 4: Проверить frontend**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

Expected: `200`

- [ ] **Step 5: Остановить и удалить тестовый проект**

```bash
cd /tmp/test-boilerplate && docker compose down -v
rm -rf /tmp/test-boilerplate
```

---

## Task 7: Создать fastapi-only/

**Files:**
- Create: `~/Desktop/projects/popovs-boilerplate/fastapi-only/` (все файлы)

- [ ] **Step 1: Создать структуру директорий**

```bash
mkdir -p ~/Desktop/projects/popovs-boilerplate/fastapi-only/app/{api,models,schemas,services}
mkdir -p ~/Desktop/projects/popovs-boilerplate/fastapi-only/{migrations,tests}
```

- [ ] **Step 2: Создать app/main.py**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/fastapi-only/app/main.py << 'EOF'
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="{{PROJECT_NAME}}", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
EOF
```

- [ ] **Step 3: Создать app/config.py**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/fastapi-only/app/config.py << 'EOF'
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = (
        "postgresql+asyncpg://postgres:postgres@db:5432/{{PROJECT_NAME}}"
    )

    class Config:
        env_file = ".env"


settings = Settings()
EOF
```

- [ ] **Step 4: Создать app/database.py**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/fastapi-only/app/database.py << 'EOF'
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import settings

engine = create_async_engine(settings.database_url)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
EOF
```

- [ ] **Step 5: Создать __init__.py файлы**

```bash
touch ~/Desktop/projects/popovs-boilerplate/fastapi-only/app/__init__.py
touch ~/Desktop/projects/popovs-boilerplate/fastapi-only/app/api/__init__.py
touch ~/Desktop/projects/popovs-boilerplate/fastapi-only/app/models/__init__.py
touch ~/Desktop/projects/popovs-boilerplate/fastapi-only/app/schemas/__init__.py
touch ~/Desktop/projects/popovs-boilerplate/fastapi-only/app/services/__init__.py
touch ~/Desktop/projects/popovs-boilerplate/fastapi-only/tests/__init__.py
```

- [ ] **Step 6: Создать migrations/init.sql, requirements.txt, pytest.ini**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/fastapi-only/migrations/init.sql << 'EOF'
-- Initial schema for {{PROJECT_NAME}}
EOF

cat > ~/Desktop/projects/popovs-boilerplate/fastapi-only/requirements.txt << 'EOF'
fastapi==0.115.0
uvicorn[standard]==0.32.0
sqlalchemy==2.0.36
asyncpg==0.30.0
pydantic==2.9.2
pydantic-settings==2.6.1
alembic==1.14.0
pytest==8.3.3
pytest-asyncio==0.24.0
httpx==0.28.0
EOF

cat > ~/Desktop/projects/popovs-boilerplate/fastapi-only/pytest.ini << 'EOF'
[pytest]
asyncio_mode = auto
EOF
```

- [ ] **Step 7: Создать Dockerfile**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/fastapi-only/Dockerfile << 'EOF'
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
EOF
```

- [ ] **Step 8: Создать docker-compose.yml, meta.yaml, .env.example**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/fastapi-only/docker-compose.yml << 'EOF'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-app}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: .
    environment:
      DATABASE_URL: postgresql+asyncpg://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@db:5432/${POSTGRES_DB:-app}
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8000:8000"
    volumes:
      - .:/app

volumes:
  postgres_data:
EOF

cat > ~/Desktop/projects/popovs-boilerplate/fastapi-only/meta.yaml << 'EOF'
name: "FastAPI Backend"
description: "Backend only: FastAPI + PostgreSQL 16 + Docker Compose. Без фронтенда."
tags: [backend, fastapi, postgres, docker]
EOF

cat > ~/Desktop/projects/popovs-boilerplate/fastapi-only/.env.example << 'EOF'
POSTGRES_USER={{PROJECT_NAME}}
POSTGRES_PASSWORD=changeme
POSTGRES_DB={{PROJECT_NAME}}
EOF
```

- [ ] **Step 9: Верифицировать fastapi-only**

```bash
mkdir -p /tmp/test-fastapi
cp -r ~/Desktop/projects/popovs-boilerplate/fastapi-only/. /tmp/test-fastapi/
find /tmp/test-fastapi -type f \( -name "*.py" -o -name "*.yml" -o -name ".env.example" \) \
  -exec sed -i '' 's/{{PROJECT_NAME}}/testapi/g' {} \;
cp /tmp/test-fastapi/.env.example /tmp/test-fastapi/.env
cd /tmp/test-fastapi && docker compose up -d --build
sleep 10
curl -s http://localhost:8000/health
```

Expected: `{"status":"ok"}`

```bash
cd /tmp/test-fastapi && docker compose down -v
rm -rf /tmp/test-fastapi
```

---

## Task 8: Создать landing/

**Files:**
- Create: `~/Desktop/projects/popovs-boilerplate/landing/` (все файлы)

- [ ] **Step 1: Создать структуру**

```bash
mkdir -p ~/Desktop/projects/popovs-boilerplate/landing/{css,js}
mkdir -p ~/Desktop/projects/popovs-boilerplate/landing/assets/images
touch ~/Desktop/projects/popovs-boilerplate/landing/assets/images/.gitkeep
```

- [ ] **Step 2: Создать index.html**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/landing/index.html << 'EOF'
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{PROJECT_NAME}}</title>
    <meta name="description" content="{{PROJECT_NAME}}">
    <link rel="canonical" href="https://{{DOMAIN}}/">
    <meta name="robots" content="index, follow">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://{{DOMAIN}}/">
    <meta property="og:title" content="{{PROJECT_NAME}}">
    <meta property="og:description" content="{{PROJECT_NAME}}">

    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <main>
        <h1>{{PROJECT_NAME}}</h1>
    </main>
    <script src="js/main.js"></script>
</body>
</html>
EOF
```

- [ ] **Step 3: Создать css/style.css и js/main.js**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/landing/css/style.css << 'EOF'
/* {{PROJECT_NAME}} styles */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: system-ui, -apple-system, sans-serif;
}
EOF

cat > ~/Desktop/projects/popovs-boilerplate/landing/js/main.js << 'EOF'
// {{PROJECT_NAME}}
EOF
```

- [ ] **Step 4: Создать robots.txt, sitemap.xml, meta.yaml**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/landing/robots.txt << 'EOF'
User-agent: *
Allow: /
Sitemap: https://{{DOMAIN}}/sitemap.xml
EOF

cat > ~/Desktop/projects/popovs-boilerplate/landing/sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://{{DOMAIN}}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
EOF

cat > ~/Desktop/projects/popovs-boilerplate/landing/meta.yaml << 'EOF'
name: "Landing Page"
description: "Статический сайт: HTML/CSS/JS. Без сервера, открывается через file:// или nginx."
tags: [landing, static, html, seo]
EOF
```

- [ ] **Step 5: Верифицировать landing (открыть в браузере)**

```bash
open ~/Desktop/projects/popovs-boilerplate/landing/index.html
```

Expected: браузер открывает страницу с `<h1>{{PROJECT_NAME}}</h1>` без ошибок в консоли.

---

## Task 9: Создать docs/

**Files:**
- Create: `~/Desktop/projects/popovs-boilerplate/docs/` (все файлы)

- [ ] **Step 1: Создать структуру**

```bash
mkdir -p ~/Desktop/projects/popovs-boilerplate/docs/content/{research,notes}
touch ~/Desktop/projects/popovs-boilerplate/docs/content/research/.gitkeep
touch ~/Desktop/projects/popovs-boilerplate/docs/content/notes/.gitkeep
```

- [ ] **Step 2: Создать mkdocs.yml**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/docs/mkdocs.yml << 'EOF'
site_name: {{PROJECT_NAME}}
site_url: https://{{DOMAIN}}
docs_dir: content

theme:
  name: material
  language: ru
  palette:
    - scheme: default
      toggle:
        icon: material/brightness-7
        name: Тёмная тема
    - scheme: slate
      toggle:
        icon: material/brightness-4
        name: Светлая тема

nav:
  - Главная: index.md
  - Ресёрч: research/
  - Заметки: notes/
EOF
```

- [ ] **Step 3: Создать content/index.md**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/docs/content/index.md << 'EOF'
# {{PROJECT_NAME}}

Добро пожаловать.
EOF
```

- [ ] **Step 4: Создать requirements.txt, meta.yaml**

```bash
cat > ~/Desktop/projects/popovs-boilerplate/docs/requirements.txt << 'EOF'
mkdocs-material>=9.5
EOF

cat > ~/Desktop/projects/popovs-boilerplate/docs/meta.yaml << 'EOF'
name: "Docs / Research"
description: "Документация и ресёрч: MkDocs Material. Для больших текстовых проектов, баз знаний, ресёрча."
tags: [docs, mkdocs, research, markdown]
EOF
```

- [ ] **Step 5: Верифицировать docs (mkdocs serve)**

```bash
cd /tmp
mkdir -p test-docs
cp -r ~/Desktop/projects/popovs-boilerplate/docs/. test-docs/
cd test-docs
sed -i '' 's/{{PROJECT_NAME}}/testdocs/g; s/{{DOMAIN}}/testdocs.popovs.tech/g' mkdocs.yml content/index.md
pip install -q mkdocs-material
mkdocs serve --dev-addr=127.0.0.1:8099 &
MKDOCS_PID=$!
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8099
```

Expected: `200`

```bash
kill $MKDOCS_PID
rm -rf /tmp/test-docs
```

---

## Task 10: Коммит template repo

**Files:** нет (git operations)

- [ ] **Step 1: Коммит всего**

```bash
cd ~/Desktop/projects/popovs-boilerplate
git add .
git commit -m "feat: добавить четыре стека шаблонов (nextjs-fastapi, fastapi-only, landing, docs)"
git push origin main
```

Expected: push прошёл, на github.com/sergeypopov/popovs-boilerplate видны все папки.

---

## Task 11: Создать SKILL.md

**Files:**
- Create: `~/Desktop/projects/ai-settings/skills/popovs/boilerplate/SKILL.md`

- [ ] **Step 1: Создать директорию**

```bash
mkdir -p ~/Desktop/projects/ai-settings/skills/popovs/boilerplate
```

- [ ] **Step 2: Создать SKILL.md**

```bash
cat > ~/Desktop/projects/ai-settings/skills/popovs/boilerplate/SKILL.md << 'SKILLEOF'
---
name: boilerplate
version: 1.0.0
description: |
  Use when starting a new project from scratch. Scaffolds project structure from
  public template repo, creates GitHub repo, copies AI settings snapshot, and
  generates a ready-to-execute deployment runbook for the Yandex Cloud VM.
  Trigger: user calls /popovs:boilerplate or says "создать новый проект / развернуть проект".
  SKIP: if the project is already initialized (git repo exists, files present).
category: devops
tags: [scaffold, boilerplate, setup, new-project]
---

# Purpose

Bootstrap a new project in one command: scaffold template, create GitHub repo,
copy AI rules snapshot, generate deployment runbook.

# Template Repository

`https://github.com/sergeypopov/popovs-boilerplate`

Each stack directory contains a `meta.yaml` with name, description, tags.
New stacks can be added to the repo — they appear in the list automatically.

# Process

## Step 1: Clone template repo

```bash
git clone --depth=1 https://github.com/sergeypopov/popovs-boilerplate /tmp/popovs-boilerplate-template
```

## Step 2: Show available stacks

Read `meta.yaml` from each subdirectory (skip `shared/`), present list:

```
Доступные стеки:
1. Next.js + FastAPI — Full-stack: Next.js 15 frontend + FastAPI backend + PostgreSQL 16 + Docker Compose
2. FastAPI Backend — Backend only: FastAPI + PostgreSQL 16 + Docker Compose. Без фронтенда.
3. Landing Page — Статический сайт: HTML/CSS/JS.
4. Docs / Research — Документация и ресёрч: MkDocs Material.
```

## Step 3: Ask questions ONE AT A TIME

Ask each question separately, wait for answer:

1. **Имя проекта?** (будет использовано как: имя GitHub репо, плейсхолдер `{{PROJECT_NAME}}` в файлах)
2. **Стек?** (показать список из meta.yaml, пронумерованный)
3. **Видимость GitHub?** `public` / `private` (default: `private`)
4. **Домен?** (пример: `my-project.popovs.tech`)

Вычислить `{{SUBDOMAIN}}` из домена: часть до первой точки.
Вычислить `{{YEAR}}` как текущий год.

## Step 4: Copy template files

```bash
# Copy shared/ files (base structure for all stacks)
cp -r /tmp/popovs-boilerplate-template/shared/. ./

# Copy chosen stack files
cp -r /tmp/popovs-boilerplate-template/<chosen-stack>/. ./

# Substitute all placeholders in all text files
find . -type f \( -name "*.py" -o -name "*.tsx" -o -name "*.ts" -o -name "*.js" \
  -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.conf" \
  -o -name "*.md" -o -name "*.html" -o -name "*.css" -o -name "*.txt" \
  -o -name "*.xml" -o -name ".env.example" -o -name "Makefile" \) \
  -exec sed -i '' \
    "s/{{PROJECT_NAME}}/$PROJECT_NAME/g; \
     s/{{DOMAIN}}/$DOMAIN/g; \
     s/{{SUBDOMAIN}}/$SUBDOMAIN/g; \
     s/{{YEAR}}/$YEAR/g" {} \;
```

## Step 5: Copy AI settings snapshot

```bash
AI_SETTINGS=~/Desktop/projects/ai-settings

# docs/ai/ — all rules
mkdir -p docs/ai
cp -r $AI_SETTINGS/docs/ai/. docs/ai/

# Agent config files
cp $AI_SETTINGS/AGENTS.md ./AGENTS.md
cp $AI_SETTINGS/CLAUDE.md ./CLAUDE.md

# Claude Code settings
mkdir -p .claude
cp $AI_SETTINGS/.claude/settings.local.json ./.claude/settings.json
```

## Step 6: Generate docs/DEPLOY.md

Read `/Users/sergeypopov/Desktop/projects/infra/runbook.md` for exact commands.

Generate `docs/DEPLOY.md` using the stack-specific template from the **Deploy Instructions** section below.

Substitute: `{{PROJECT_NAME}}`, `{{DOMAIN}}`, `{{SUBDOMAIN}}` with actual values.

## Step 7: Create GitHub repo and push

```bash
# Init git
git init
git add .
git commit -m "chore: инициализировать проект $PROJECT_NAME"

# Create GitHub repo
gh repo create $PROJECT_NAME --$([ "$VISIBILITY" = "public" ] && echo "public" || echo "private") \
  --source=. --remote=origin

# Push
git push -u origin main
```

## Step 8: Cleanup and report

```bash
rm -rf /tmp/popovs-boilerplate-template
```

Report to user:
```
Проект готов.

Репо: https://github.com/sergeypopov/$PROJECT_NAME
Локальный запуск: см. README.md
Деплой когда будешь готов: см. docs/DEPLOY.md
```

# Deploy Instructions by Stack

## For `nextjs-fastapi` and `fastapi-only`

Generate `docs/DEPLOY.md` with exact content:

```markdown
# Deploy: {{PROJECT_NAME}}

## 1. SSH на VM

```bash
ssh meridian
```

## 2. Создать директорию проекта

```bash
mkdir /opt/{{PROJECT_NAME}}
```

## 3. Добавить nginx vhost в ingress

Локально, в репо `~/Desktop/projects/ingress`, добавить в `nginx.conf`:

```nginx
server {
    listen 443 ssl;
    server_name {{DOMAIN}};

    ssl_certificate /etc/letsencrypt/live/meridian.popovs.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/meridian.popovs.tech/privkey.pem;

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Задеплоить:

```bash
cd ~/Desktop/projects/ingress
git add -A && git commit -m "feat(nginx): добавить {{PROJECT_NAME}}"
git push origin main && git push prod main
```

## 4. Расширить SSL-сертификат (добавить {{DOMAIN}})

```bash
ssh meridian
docker run --rm \
  -v /opt/ingress/letsencrypt:/etc/letsencrypt \
  -v /opt/ingress/certbot-www:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d meridian.popovs.tech -d uptime.popovs.tech -d status.popovs.tech -d kp.popovs.tech -d {{DOMAIN}} \
  --expand --email s.popov.works@gmail.com --agree-tos --no-eff-email --non-interactive
docker exec ingress-nginx nginx -s reload
```

**Важно:** перечислить ВСЕ существующие домены через `-d`, иначе они выпадут из SAN.

## 5. Добавить DNS A-запись

```bash
~/yandex-cloud/bin/yc dns zone add-records --name popovs-tech-zone \
  --record "{{SUBDOMAIN}} 300 A 93.77.187.42"
```

## 6. Настроить autodeploy на VM

```bash
ssh meridian
mkdir -p /srv/git/{{PROJECT_NAME}}.git
cd /srv/git/{{PROJECT_NAME}}.git
git init --bare
cat > hooks/post-receive << 'EOF'
#!/bin/bash
set -e
GIT_WORK_TREE=/opt/{{PROJECT_NAME}} git checkout -f main
cd /opt/{{PROJECT_NAME}}
docker compose up -d --build
EOF
chmod +x hooks/post-receive
```

## 7. Добавить prod remote локально

```bash
git remote add prod meridian:/srv/git/{{PROJECT_NAME}}.git
```

## 8. Создать .env.production на VM

```bash
ssh meridian "nano /opt/{{PROJECT_NAME}}/.env.production"
```

Заполнить по шаблону из `.env.example`. Пароли генерировать через:

```bash
openssl rand -hex 16
```

## 9. Деплой

```bash
git push prod main
```

Проверить: https://{{DOMAIN}}
```

## For `landing`

Same steps 1–7 as above, but in nginx vhost use `root`:

```nginx
location / {
    root /opt/{{PROJECT_NAME}}/public;
    try_files $uri $uri/ /index.html;
}
```

Step 6 post-receive hook for landing:
```bash
cat > hooks/post-receive << 'EOF'
#!/bin/bash
set -e
mkdir -p /tmp/{{PROJECT_NAME}}-deploy
GIT_WORK_TREE=/tmp/{{PROJECT_NAME}}-deploy git checkout -f main
rsync -av --delete /tmp/{{PROJECT_NAME}}-deploy/ /opt/{{PROJECT_NAME}}/public/
rm -rf /tmp/{{PROJECT_NAME}}-deploy
EOF
```

No .env.production needed for static sites. Skip step 8.

## For `docs`

Same steps 1–7 as above, nginx vhost:

```nginx
location / {
    root /opt/{{PROJECT_NAME}}/site;
    index index.html;
    try_files $uri $uri/ =404;
}
```

Step 6 post-receive hook for docs:
```bash
cat > hooks/post-receive << 'EOF'
#!/bin/bash
set -e
GIT_WORK_TREE=/opt/{{PROJECT_NAME}} git checkout -f main
cd /opt/{{PROJECT_NAME}}
pip install -q mkdocs-material
mkdocs build --site-dir site
EOF
```

No .env.production needed. Skip step 8.

# Placeholder Reference

| Placeholder | Example | Used in |
|---|---|---|
| `{{PROJECT_NAME}}` | `my-blog` | repo name, docker service names, VM paths, package names |
| `{{DOMAIN}}` | `my-blog.popovs.tech` | nginx config, sitemap, robots, OG meta, sitemap.ts |
| `{{SUBDOMAIN}}` | `my-blog` | DNS record name (`{{SUBDOMAIN}} 300 A 93.77.187.42`) |
| `{{YEAR}}` | `2026` | CHANGELOG, README |

# Rules

- Ask questions one at a time. Never batch them.
- Do not start any development work until setup is fully complete.
- If `gh` CLI is not authenticated, ask user to run `gh auth login` first.
- If current directory is not empty, warn the user and ask to confirm before proceeding.
SKILLEOF
```

- [ ] **Step 3: Проверить что файл создан**

```bash
head -5 ~/Desktop/projects/ai-settings/skills/popovs/boilerplate/SKILL.md
```

Expected: `---` + frontmatter

---

## Task 12: Создать README.md и CHANGELOG.md скилла

**Files:**
- Create: `skills/popovs/boilerplate/README.md`
- Create: `skills/popovs/boilerplate/CHANGELOG.md`

- [ ] **Step 1: Создать README.md**

```bash
cat > ~/Desktop/projects/ai-settings/skills/popovs/boilerplate/README.md << 'EOF'
# popovs:boilerplate

Скилл разворачивает новый проект: структуру, GitHub репо, AI-правила, инструкцию деплоя.

## Когда вызывается

- `/popovs:boilerplate`
- «создать новый проект», «развернуть проект»

## Что делает

1. Подтягивает актуальные шаблоны из [sergeypopov/popovs-boilerplate](https://github.com/sergeypopov/popovs-boilerplate)
2. Задаёт 4 вопроса: имя проекта, стек, видимость GitHub, домен
3. Копирует шаблон и подставляет плейсхолдеры
4. Копирует снэпшот AI-правил из ai-settings (`docs/ai/`, `AGENTS.md`, `CLAUDE.md`)
5. Генерирует `docs/DEPLOY.md` с полными командами для VM
6. Создаёт GitHub репо и делает начальный коммит

## Доступные стеки

| Стек | Описание |
|---|---|
| `nextjs-fastapi` | Next.js 15 + FastAPI + PostgreSQL + Docker |
| `fastapi-only` | FastAPI + PostgreSQL + Docker |
| `landing` | Статический HTML/CSS/JS |
| `docs` | Документация / ресёрч (MkDocs Material) |

Новые стеки добавляются в репо `popovs-boilerplate` — появляются автоматически.

## После запуска

- Локальный запуск: `README.md` в проекте
- Деплой: `docs/DEPLOY.md` — все команды готовы к исполнению
EOF
```

- [ ] **Step 2: Создать CHANGELOG.md**

```bash
cat > ~/Desktop/projects/ai-settings/skills/popovs/boilerplate/CHANGELOG.md << 'EOF'
# CHANGELOG — popovs:boilerplate

Формат: [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

## [1.0.0] — 2026-04-19

### Первый релиз

- Создание нового проекта из шаблона одной командой `/popovs:boilerplate`
- Четыре стека: `nextjs-fastapi`, `fastapi-only`, `landing`, `docs`
- Автоматическое копирование снэпшота AI-правил из ai-settings
- Генерация `docs/DEPLOY.md` по паттернам infra-репо
- Создание GitHub репо и начальный коммит
EOF
```

---

## Task 13: Коммит скилла в ai-settings

**Files:** нет (git operations)

- [ ] **Step 1: Обновить skills/README.md — добавить boilerplate в список**

В файле `~/Desktop/projects/ai-settings/skills/README.md` найти секцию `## Стартовый набор` и добавить строку:

```markdown
- `popovs/boilerplate` — разворачивает новый проект: структуру, GitHub репо, AI-правила, инструкцию деплоя.
```

Итоговый блок будет выглядеть так:
```markdown
## Стартовый набор

- `popovs/ru-commit-message` — conventional commit на русском из staged diff.
- `popovs/ru-pr-description` — PR-описание на русском по шаблону.
- `popovs/changelog-entry` — запись в корневой `CHANGELOG.md` проекта.
- `popovs/tg-post-writer` — Telegram-посты в личной стилистике.
- `popovs/boilerplate` — разворачивает новый проект: структуру, GitHub репо, AI-правила, инструкцию деплоя.
```

- [ ] **Step 2: Добавить в git и закоммитить**

```bash
cd ~/Desktop/projects/ai-settings
git add skills/popovs/boilerplate/ skills/README.md
git commit -m "feat(skills): добавить скилл popovs:boilerplate для развёртки новых проектов"
git push origin main
```

Expected: push прошёл, файлы видны на GitHub.

---

## Task 14: Финальная верификация

- [ ] **Step 1: Создать тестовый проект через скилл**

Открыть новую пустую директорию в Claude Code:

```bash
mkdir -p /tmp/test-skill-project
cd /tmp/test-skill-project
```

Вызвать `/popovs:boilerplate`, ответить:
- Имя: `skill-test`
- Стек: `nextjs-fastapi`
- Видимость: `private`
- Домен: `skill-test.popovs.tech`

- [ ] **Step 2: Проверить структуру**

```bash
ls /tmp/test-skill-project/
ls /tmp/test-skill-project/docs/ai/
cat /tmp/test-skill-project/AGENTS.md | head -5
cat /tmp/test-skill-project/docs/DEPLOY.md | head -20
```

Expected: `docs/ai/` содержит файлы, `AGENTS.md` существует, `DEPLOY.md` содержит `skill-test` и `93.77.187.42`.

- [ ] **Step 3: Проверить что docker-compose поднимается**

```bash
cd /tmp/test-skill-project
cp .env.example .env
docker compose up -d --build
sleep 15
curl -s http://localhost:8000/health
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

Expected: `{"status":"ok"}` и `200`.

- [ ] **Step 4: Убрать тестовый проект**

```bash
cd /tmp/test-skill-project
docker compose down -v
cd /tmp
rm -rf test-skill-project
gh repo delete skill-test --yes 2>/dev/null || true
```
