# Sazionalidade

Aplicação web para análise de sazonalidade e viés histórico de ativos.

## Stack

- Next.js com TypeScript
- Drizzle ORM
- SQLite para desenvolvimento/local seed
- Vercel Analytics
- Deploy integrado à Vercel

## Desenvolvimento

```bash
npm install
npm run dev
```

Antes de usar o banco, confira as variáveis de ambiente e a configuração em `drizzle.config.json`.

## Validação

```bash
npm run lint
npm run build
```

A validação deve ser executada no ambiente local ou no pipeline da Vercel antes do deploy de produção.

## Estrutura

- `src/app`: páginas, layout e rotas da API
- `src/components`: componentes da interface
- `src/db`: conexão e schema do banco
- `src/lib`: regras de sazonalidade e dados iniciais
- `src/types`: tipos compartilhados

## Banco de dados

Arquivos SQLite locais e auxiliares WAL/SHM não devem ser versionados. Para produção serverless, utilize um banco persistente compatível com o ambiente de deploy; não dependa de escrita em disco local da Vercel.

## Deploy

O projeto está vinculado ao repositório `xttrader-br/sazionalidade` na Vercel. Cada push na branch de produção pode disparar um novo deploy conforme as configurações do projeto.

## Licença

Definir licença antes da distribuição pública.
