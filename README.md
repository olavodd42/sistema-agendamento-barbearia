# BarberFlow ✂️

Sistema full-stack para **agendamento de barbearia**, com fluxo público para clientes e painel administrativo autenticado.

Projeto construído para prática real de arquitetura web moderna e apresentação em portfólio.

## 📌 Visão geral

O BarberFlow possui dois módulos principais:

- **Frontend** (`frontend/`): aplicação em Next.js (App Router)
- **Backend** (`backend/`): API REST com Express + Prisma

Fluxos atuais implementados:

- Cliente consulta horários disponíveis
- Cliente cria agendamento público
- Admin faz login com JWT
- Admin visualiza agenda por data
- Admin altera status do atendimento (agendado, concluído, cancelado)

## 🧰 Stack técnica

### Frontend (app web)

- Next.js 16
- React 19
- Tailwind CSS 4

### Backend (API)

- Node.js + Express 5
- Prisma ORM
- PostgreSQL
- Zod (validação)
- JWT + bcryptjs (autenticação)
- Helmet + Rate Limit + CORS (hardening)

## 🏗️ Arquitetura resumida

```text
Frontend (Next.js)
   |
   | HTTP (REST)
   v
Backend (Express)
   |
   v
Prisma ORM
   |
   v
PostgreSQL
```

## 📁 Estrutura do projeto

```text
sistema-agendamento-barbearia/
├─ backend/
│  ├─ prisma/
│  └─ src/
├─ frontend/
│  ├─ src/
│  └─ public/
├─ postman/
└─ README.md
```

## ✅ Pré-requisitos

- Node.js **18+** (recomendado: 20+)
- npm
- PostgreSQL rodando localmente

## ⚙️ Configuração de ambiente

### Backend (`backend/.env`)

Copie `backend/.env.example` para `backend/.env`.

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | Sim | URL de conexão PostgreSQL |
| `JWT_SECRET` | Sim | Chave de assinatura JWT (use 32+ caracteres) |
| `PORT` | Não | Porta da API (padrão: `3333`) |
| `CORS_ORIGIN` | Não | Origem permitida (ex.: `http://localhost:3000`) |

### Frontend (`frontend/.env.local`)

Copie `frontend/.env.example` para `frontend/.env.local`.

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Sim | URL base da API |
| `NEXT_PUBLIC_API_TIMEOUT_MS` | Não | Timeout das requisições (ms) |

## 🚀 Como rodar localmente

### 1) Backend (execução local)

```bash
cd backend
npm install
npm run prisma:migrate
npm run seed
npm run dev
```

API disponível em: `http://localhost:3333`

### 2) Frontend (execução local)

```bash
cd frontend
npm install
npm run dev
```

App disponível em: `http://localhost:3000`

## 🔐 Credenciais admin (seed)

Após rodar `npm run seed` no backend:

- **Email:** `admin@teste.com`
- **Senha:** `123456`

> Recomendado trocar credenciais em ambiente real.

## 📜 Scripts disponíveis

### Scripts do Backend

- `npm run dev` — inicia backend com nodemon
- `npm run start` — inicia backend em modo normal
- `npm run prisma:migrate` — aplica/cria migrações
- `npm run prisma:studio` — abre Prisma Studio
- `npm run seed` — cria admin inicial

### Scripts do Frontend

- `npm run dev` — inicia frontend em desenvolvimento
- `npm run build` — build de produção
- `npm run start` — executa build de produção
- `npm run lint` — validação com ESLint

## 🌐 Rotas principais da API

### Saúde

- `GET /health` — health-check da API

### Autenticação

- `POST /auth/login` — login admin
- `GET /auth/me` — dados do admin autenticado

### Agendamentos

- `GET /appointments/available?date=YYYY-MM-DD` — horários disponíveis (público)
- `POST /appointments` — criar agendamento (público)
- `GET /appointments?date=YYYY-MM-DD` — listar agenda do dia (admin)
- `PATCH /appointments/:id/status` — atualizar status (admin)

### Clientes

- `GET /customers` — listar clientes (admin)
- `POST /customers` — criar cliente (admin)

## 🗃️ Modelo de dados (Prisma)

- `Admin`
- `Customer`
- `Appointment`
- `AppointmentStatus`: `SCHEDULED`, `DONE`, `CANCELED`

Regra importante: `Appointment.date` é único, evitando dois agendamentos no mesmo horário.

## 🛡️ Robustez implementada

- Validação de payload com Zod
- Tratamento global de erros no backend
- `requestId` para rastreabilidade
- Proteções com Helmet e Rate Limiting
- CORS configurável por ambiente
- API client no frontend com timeout e mensagens amigáveis
- Fallbacks de erro/loading no App Router

## 🧪 Testes manuais sugeridos

1. Criar agendamento para uma data futura
2. Tentar criar novo agendamento no mesmo horário (esperar conflito)
3. Login admin e atualização de status
4. Acessar painel admin sem token (redirecionamento para login)

## 🛠️ Troubleshooting

- **Aviso `JWT_SECRET curto para desenvolvimento`**
  - Não quebra a aplicação, mas indica chave fraca.
  - Solução: usar valor forte com 32+ caracteres.

- **Warning de múltiplos lockfiles no Next.js**
  - Já mitigado com `outputFileTracingRoot` no `frontend/next.config.mjs`.

- **Erro de CORS**
  - Verifique se `CORS_ORIGIN` (backend) e `NEXT_PUBLIC_API_URL` (frontend) estão alinhados.

## 🗺️ Roadmap (próximos passos)

- Testes automatizados (API + interface)
- CI com lint/build/test
- Dashboard com métricas de atendimento
- Confirmação/cancelamento via WhatsApp
- Deploy cloud (frontend + API + banco)

## 💼 Valor para portfólio

Este projeto evidencia:

- arquitetura full-stack organizada
- regras de negócio reais de agenda
- autenticação e autorização com JWT
- boas práticas de robustez e segurança
- foco em UX e manutenção do código
