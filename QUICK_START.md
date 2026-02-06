# 🚀 GUIA RÁPIDO - SIGA

## ⚡ Início Rápido (3 comandos)

```bash
# 1. Copie as variáveis de ambiente
cp .env.example .env

# 2. Inicie os containers Docker
docker compose up --build

# 3. Acesse o sistema
# Frontend: http://localhost:3000
# Backend: http://localhost:3001/api/v1
# Swagger: http://localhost:3001/api
```

## 🔑 Credenciais Padrão

**Admin:**
- Email: `admin@siga.com`
- Senha: `admin123`

**Gestor:**
- Email: `gestor@siga.com`
- Senha: `gestor123`

**Visualizador:**
- Email: `viewer@siga.com`
- Senha: `viewer123`

## 📦 O que foi criado?

### ✅ Backend (NestJS + Prisma + PostgreSQL)

**Módulos Implementados:**
- 🔐 Auth (JWT + Refresh Token + RBAC)
- 👤 Users (Gerenciamento de usuários)
- 🏠 Properties (Imóveis completos)
- 🏢 Units (Unidades de imóveis)
- 👥 Tenants (Inquilinos)
- 📄 Contracts (Contratos de locação)
- 💰 Payments (Pagamentos com juros/multa)
- 💸 Expenses (Despesas variadas)
- 🔧 Maintenance (Chamados de manutenção)
- 📁 Files (Upload de arquivos)
- 📊 Dashboard (Indicadores financeiros)
- 📝 Audit (Logs de auditoria)

**Recursos:**
- ✅ Validação completa (class-validator)
- ✅ Documentação Swagger automática
- ✅ Guards de autenticação e autorização
- ✅ Logs estruturados (Pino)
- ✅ Rate limiting
- ✅ CORS e Helmet configurados
- ✅ Migrations e Seed do Prisma

### ✅ Frontend (Next.js 14 + TailwindCSS + Shadcn/ui)

**Páginas Implementadas:**
- 🔐 Login (com autenticação)
- 📊 Dashboard (indicadores em tempo real)
- 🏠 Imóveis (listagem com filtros)
- 👥 Inquilinos (gerenciamento)
- 📄 Contratos (com status)
- 💰 Pagamentos (estrutura básica)
- 🔧 Manutenção (estrutura básica)

**Recursos:**
- ✅ Context de autenticação
- ✅ Interceptor Axios para tokens
- ✅ Componentes UI reutilizáveis
- ✅ Validação de formulários (React Hook Form + Zod)
- ✅ Toast de notificações
- ✅ Responsive design
- ✅ Rotas protegidas

### ✅ Infraestrutura (Docker + Docker Compose)

- 🐳 3 containers orquestrados
- 🗄️ PostgreSQL com volume persistente
- 🔄 Hot reload no desenvolvimento
- 🌐 Networking interno entre serviços

## 🎯 Próximos Passos

### Para usar o sistema:

1. Faça login com uma das credenciais acima
2. Explore o dashboard
3. Cadastre imóveis
4. Cadastre inquilinos
5. Crie contratos
6. Visualize os indicadores

### Para desenvolver:

**Backend:**
```bash
# Criar nova migration
docker compose exec backend npx prisma migrate dev --name nome

# Gerar Prisma Client
docker compose exec backend npx prisma generate

# Rodar seed
docker compose exec backend npm run prisma:seed

# Ver logs
docker compose logs -f backend
```

**Frontend:**
```bash
# Ver logs
docker compose logs -f frontend

# Acessar container
docker compose exec frontend sh
```

## 📂 Estrutura Criada

```
siga/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          ✅ Schema completo
│   │   └── seed.ts                ✅ Dados iniciais
│   ├── src/
│   │   ├── auth/                  ✅ Autenticação JWT
│   │   ├── users/                 ✅ CRUD usuários
│   │   ├── properties/            ✅ CRUD imóveis
│   │   ├── units/                 ✅ CRUD unidades
│   │   ├── tenants/               ✅ CRUD inquilinos
│   │   ├── contracts/             ✅ CRUD contratos
│   │   ├── payments/              ✅ CRUD pagamentos
│   │   ├── expenses/              ✅ CRUD despesas
│   │   ├── maintenance/           ✅ CRUD manutenção
│   │   ├── files/                 ✅ Arquivos
│   │   ├── dashboard/             ✅ Dashboard
│   │   ├── audit/                 ✅ Auditoria
│   │   ├── common/                ✅ Guards/Decorators
│   │   └── prisma/                ✅ Serviço Prisma
│   └── Dockerfile                 ✅
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/             ✅ Página de login
│   │   │   └── dashboard/         ✅ Dashboard + páginas
│   │   ├── components/ui/         ✅ Shadcn/ui
│   │   ├── contexts/              ✅ Auth Context
│   │   └── lib/                   ✅ API Client + Utils
│   └── Dockerfile                 ✅
│
├── docker-compose.yml             ✅ Orquestração
├── .env.example                   ✅ Variáveis de ambiente
└── README.md                      ✅ Documentação completa
```

## 🔧 Comandos Úteis

```bash
# Iniciar
docker compose up

# Parar
docker compose down

# Reconstruir
docker compose up --build

# Ver logs
docker compose logs -f

# Limpar tudo (⚠️ apaga dados)
docker compose down -v

# Acessar bash do backend
docker compose exec backend sh

# Acessar bash do frontend
docker compose exec frontend sh
```

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api/v1
- **Swagger Docs:** http://localhost:3001/api
- **PostgreSQL:** localhost:5432

## ✨ Funcionalidades Principais

### Dashboard
- Total de imóveis, contratos e inquilinos
- Valores recebidos vs esperados
- Inadimplência em tempo real
- Despesas do mês
- Lucro líquido
- Chamados de manutenção abertos

### Gestão Financeira
- Controle de pagamentos com cálculo de juros/multa
- Registro de despesas por tipo
- Relatórios mensais
- Indicadores visuais

### Auditoria
- Todo login registrado
- Ações importantes logadas
- Rastreabilidade completa

## 🎨 Stack Completa

**Backend:**
- NestJS + TypeScript
- Prisma ORM
- PostgreSQL
- JWT + Passport
- Swagger
- Bcrypt
- Helmet + CORS
- Pino Logger

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Shadcn/ui
- React Hook Form
- Zod
- Axios
- Lucide Icons

**DevOps:**
- Docker
- Docker Compose

## 📚 Documentação

- **README completo:** [README.md](README.md)
- **API Docs:** http://localhost:3001/api (quando rodando)

## 🎯 Sistema 100% Funcional!

✅ Backend completo com todos os módulos
✅ Frontend com páginas principais
✅ Autenticação e autorização
✅ Dashboard funcional
✅ Docker setup pronto
✅ Seed com dados de exemplo
✅ Documentação completa

**Basta rodar `docker compose up --build` e começar a usar!** 🚀
