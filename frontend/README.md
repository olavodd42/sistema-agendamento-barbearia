# Frontend - BarberFlow

Interface web do sistema de agendamento, construída com **Next.js 16 (App Router)**.

## Páginas principais

- `/` página inicial com acesso rápido aos fluxos
- `/agendar` fluxo público de reserva
- `/admin/login` autenticação de administrador
- `/admin/agenda` painel de gestão de agendamentos

## Configuração

1. Copie o arquivo `.env.example` para `.env.local`
2. Ajuste `NEXT_PUBLIC_API_URL` para a URL da API backend

## Scripts

- `npm run dev` inicia ambiente de desenvolvimento
- `npm run build` gera build de produção
- `npm run start` executa build de produção
- `npm run lint` roda validação de lint

## Observações

- O cliente HTTP (`src/lib/api.js`) possui timeout e tratamento de erros de rede
- Há fallback global para erros e loading no App Router
- Metadados e conteúdo foram adaptados para apresentação de portfólio
