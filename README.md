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

O workflow em `.github/workflows/ci.yml` executa lint e build em push/PR para `main`.

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

## Deploy

O projeto está vinculado ao repositório `xttrader-br/sazionalidade` na Vercel. Cada push na branch de produção pode disparar um novo deploy conforme as configurações do projeto.

## Licença

MIT — ver `LICENSE`.
