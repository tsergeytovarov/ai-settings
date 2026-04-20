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

`https://github.com/tsergeytovarov/popovs-boilerplate`

Each stack directory contains a `meta.yaml` with name, description, tags.
New stacks can be added to the repo — they appear in the list automatically.

# Process

## Step 1: Clone template repo

```bash
git clone --depth=1 https://github.com/tsergeytovarov/popovs-boilerplate /tmp/popovs-boilerplate-template
```

## Step 2: Show available stacks

Read `meta.yaml` from each subdirectory (skip `shared/` and any hidden dirs), present numbered list:

```
Доступные стеки:
1. Next.js + FastAPI — Full-stack: Next.js 15 frontend + FastAPI backend + PostgreSQL 16 + Docker Compose
2. FastAPI Backend — Backend only: FastAPI + PostgreSQL 16 + Docker Compose. Без фронтенда.
3. Landing Page — Статический сайт: HTML/CSS/JS.
4. Docs / Research — Документация и ресёрч: MkDocs Material.
```

## Step 3: Ask questions ONE AT A TIME

Ask each question separately, wait for answer before asking the next:

1. **Имя проекта?** (будет использовано как имя GitHub репо и плейсхолдер `{{PROJECT_NAME}}` в файлах)
2. **Стек?** (показать список из meta.yaml, пронумерованный)
3. **Видимость GitHub?** `public` / `private` (default: `private`)
4. **Домен?** (пример: `my-project.popovs.tech`)

After answers, compute:
- `{{SUBDOMAIN}}` = part of domain before first dot (e.g. `my-project` from `my-project.popovs.tech`)
- `{{YEAR}}` = current year

## Step 4: Copy template files

```bash
# Copy shared/ files (base structure for all stacks)
cp -r /tmp/popovs-boilerplate-template/shared/. ./

# Copy chosen stack files (overrides shared if same filename)
cp -r /tmp/popovs-boilerplate-template/<chosen-stack>/. ./

# Substitute all placeholders in all text files
find . -type f \( -name "*.py" -o -name "*.tsx" -o -name "*.ts" -o -name "*.js" \
  -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.conf" \
  -o -name "*.md" -o -name "*.html" -o -name "*.css" -o -name "*.txt" \
  -o -name "*.xml" -o -name ".env.example" -o -name "Makefile" \) \
  -not -path "*/node_modules/*" \
  -exec sed -i '' \
    "s/{{PROJECT_NAME}}/$PROJECT_NAME/g; \
     s/{{DOMAIN}}/$DOMAIN/g; \
     s/{{SUBDOMAIN}}/$SUBDOMAIN/g; \
     s/{{YEAR}}/$YEAR/g" {} \;
```

## Step 5: Copy AI settings snapshot

```bash
AI_SETTINGS=~/Desktop/projects/ai-settings

# docs/ai/ — all AI rules
mkdir -p docs/ai
cp -r $AI_SETTINGS/docs/ai/. docs/ai/

# Agent config files
cp $AI_SETTINGS/AGENTS.md ./AGENTS.md
cp $AI_SETTINGS/CLAUDE.md ./CLAUDE.md

# Claude Code settings
mkdir -p .claude
cp $AI_SETTINGS/.claude/settings.local.json ./.claude/settings.json

# Generate .claude/CLAUDE.md with model hints and MCP guard
cat > .claude/CLAUDE.md << 'EOF'
## Подсказки по модели и усилию

В конце каждого ответа, где предлагается следующий шаг или запускается задача, добавляй подсказку формата:

> 💡 *Для этого подойдёт **[модель]** + **[effort]***

Маппинг:
- **Haiku** — поиск по кодовой базе, explore-агенты, bash-команды, саммари, простые правки. Effort: не нужен.
- **Sonnet** — большинство задач: коммиты, PR, объяснения, скилы, планирование, рефакторинг. Effort: medium (по умолчанию).
- **Opus** — архитектурные решения, глубокий code review, дизайн-ревью, сложный дебаг, длинный контекст, ресёрч. Effort: high или xhigh.

Effort уровни: `low` / `medium` / `high` / `xhigh` — переключаются командой `/effort`.
Модель — командой `/model`.

Подсказку давай кратко, одной строкой, только когда уместно.

## MCP-серверы

Не вызывай инструменты MCP-серверов (Notion, Confluence, Claude_in_Chrome, scheduled-tasks) без явной просьбы пользователя.
EOF
```

## Step 6: Generate docs/DEPLOY.md

Read `~/Desktop/projects/infra/runbook.md` for exact commands.

Generate `docs/DEPLOY.md` using the stack-specific template from the **Deploy Instructions** section below.

Substitute `{{PROJECT_NAME}}`, `{{DOMAIN}}`, `{{SUBDOMAIN}}` with actual values collected in Step 3.

## Step 7: Create GitHub repo and push

```bash
# Init git
git init
git add .
git commit -m "chore: инициализировать проект $PROJECT_NAME"

# Create GitHub repo and push
gh repo create $PROJECT_NAME --$([ "$VISIBILITY" = "public" ] && echo "public" || echo "private") \
  --source=. --remote=origin --push
```

## Step 8: Cleanup and report

```bash
rm -rf /tmp/popovs-boilerplate-template
```

Report to user:
```
Проект готов.

Репо: https://github.com/tsergeytovarov/$PROJECT_NAME
Локальный запуск: см. README.md
Деплой когда будешь готов: см. docs/DEPLOY.md
```

# Deploy Instructions by Stack

## For `nextjs-fastapi` and `fastapi-only`

Generate `docs/DEPLOY.md` with this content (substitute placeholders):

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

Локально, в репо `~/Desktop/projects/ingress/`, добавить `server` блок в `nginx.conf`:

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

Задеплоить ingress:

```bash
cd ~/Desktop/projects/ingress
git add -A && git commit -m "feat(nginx): добавить {{PROJECT_NAME}}"
git push origin main && git push prod main
```

## 4. Расширить SSL-сертификат

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

Важно: перечислить ВСЕ существующие домены через `-d`, иначе они выпадут из SAN.

## 5. Добавить DNS A-запись

```bash
~/yandex-cloud/bin/yc dns zone add-records --name popovs-tech-zone \
  --record "{{SUBDOMAIN}} 300 A 93.77.187.42"
```

## 6. Настроить autodeploy на VM

```bash
ssh meridian
mkdir -p /srv/git/{{PROJECT_NAME}}.git && cd /srv/git/{{PROJECT_NAME}}.git && git init --bare
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

Заполнить по образцу из `.env.example`. Пароли генерировать через `openssl rand -hex 16`.

## 9. Деплой

```bash
git push prod main
```

Проверить: https://{{DOMAIN}}
```

## For `landing`

Same as above for steps 1–7, but:
- nginx vhost uses `root /opt/{{PROJECT_NAME}}/public/` with `try_files $uri $uri/ /index.html`
- post-receive hook uses rsync:
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
- Skip step 8 (no `.env.production` for static sites)

## For `docs`

Same as above for steps 1–7, but:
- nginx vhost uses `root /opt/{{PROJECT_NAME}}/site/` with `index index.html; try_files $uri $uri/ =404`
- post-receive hook builds MkDocs:
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
- Skip step 8 (no `.env.production` for docs sites)

# Placeholder Reference

| Placeholder | Example | Used in |
|---|---|---|
| `{{PROJECT_NAME}}` | `my-blog` | repo name, docker service names, VM paths |
| `{{DOMAIN}}` | `my-blog.popovs.tech` | nginx, sitemap, robots, OG meta |
| `{{SUBDOMAIN}}` | `my-blog` | DNS record (`{{SUBDOMAIN}} 300 A 93.77.187.42`) |
| `{{YEAR}}` | `2026` | CHANGELOG, README |

# Rules

- Ask questions one at a time. Never batch them.
- Do not start any development work until setup is fully complete.
- If `gh` CLI is not authenticated, ask user to run `gh auth login` first.
- If the current directory is not empty, warn the user and ask for confirmation before proceeding.
