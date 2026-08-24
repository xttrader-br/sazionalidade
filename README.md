# Sazionalidade

Aplicação web para análise de sazonalidade e viés histórico de ativos.

## Stack

- Next.js 15 com TypeScript e React 19
- Drizzle ORM + `@libsql/client` (SQLite local ou Turso em produção)
- Vercel Analytics
- Deploy integrado à Vercel

## Desenvolvimento

```bash
cp .env.example .env
npm install
npm run dev
```

Antes de usar o banco, confira as variáveis de ambiente e a configuração em `drizzle.config.json`.

## Validação

```bash
npm run lint
npm run build
```

O modelo de CI está em `docs/github-ci.yml` (lint + build). Copie para `.github/workflows/ci.yml` quando o token do GitHub tiver permissão `workflows`.

## Estrutura

- `src/app`: páginas, layout e rotas da API
- `src/components`: componentes da interface
- `src/db`: conexão e schema do banco
- `src/lib`: regras de sazonalidade e dados iniciais
- `src/types`: tipos compartilhados

## Banco de dados

Arquivos SQLite locais (`*.db`, `*.db-wal`, `*.db-shm`) **não são versionados**.

Em produção serverless (Vercel) o SQLite em disco é **efêmero** (`/tmp`). Não dependa de escrita persistente no filesystem da função. Para dados reais, use um banco persistente (Neon, Turso, Cloudflare Hyperdrive / Postgres) e configure a URL no ambiente de deploy.

Scripts Drizzle:

```bash
npm run db:generate
npm run db:studio
```

## Deploy na Vercel (import do GitHub)

Pronto para **Add New Project → Import** em [vercel.com/new](https://vercel.com/new):

| Campo na Vercel | Valor |
|---|---|
| Framework Preset | Next.js (detectado; `vercel.json` confirma) |
| Root Directory | `.` (raiz do repo) |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output | automático do Next.js (não use static export) |
| Node | 20+ (`engines` no `package.json`) |

**Variáveis de ambiente:** nenhuma é obrigatória para o primeiro deploy. Sem `DATABASE_URL` a API usa SQLite em memória, faz o seed e a UI sobe. Dados somem em cold start.

Para persistir (recomendado depois):

1. Crie um banco [Turso](https://turso.tech)
2. Em **Settings → Environment Variables** (Production + Preview):
   - `DATABASE_URL` = `libsql://...`
   - `DATABASE_AUTH_TOKEN` = token do Turso
3. Redeploy

O `@vercel/analytics` já está no layout. Depois do deploy, ative Analytics no projeto se quiser o painel.

Branch desta sessão: `arena/01a034a9-sazionalidade`. No import, selecione essa branch se ainda não mergeou em `main`.

## Licença

MIT — ver `LICENSE`.
