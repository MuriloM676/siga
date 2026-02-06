# SIGA - Sistema Integrado de Gestão de Aluguéis

![Status](https://img.shields.io/badge/Status-Completo-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

Sistema web completo e profissional para gerenciamento de imóveis de aluguel, desenvolvido com Next.js, NestJS, PostgreSQL e Prisma.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Credenciais de Teste](#credenciais-de-teste)
- [API Documentation](#api-documentation)
- [Arquitetura](#arquitetura)

## 🎯 Sobre o Projeto

O **SIGA** é um sistema completo desenvolvido para auxiliar na gestão de imóveis de aluguel, substituindo planilhas Excel por uma solução web moderna, segura e escalável.

### Principais Objetivos

- ✅ Gerenciar cadastro completo de imóveis e unidades
- ✅ Controlar contratos e inquilinos
- ✅ Gestão financeira mensal (pagamentos e despesas)
- ✅ Controle de inadimplência
- ✅ Gerenciamento de manutenção e chamados
- ✅ Dashboard com indicadores e relatórios
- ✅ Upload de documentos e imagens
- ✅ Sistema de auditoria e logs
- ✅ Controle de acesso por perfil (RBAC)

## 🚀 Tecnologias

### Backend
- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[Prisma ORM](https://www.prisma.io/)** - ORM moderno para TypeScript/Node.js
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[JWT](https://jwt.io/)** - Autenticação com JSON Web Tokens
- **[Passport](http://www.passportjs.org/)** - Middleware de autenticação
- **[Swagger](https://swagger.io/)** - Documentação automática da API
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Hash de senhas
- **[Helmet](https://helmetjs.github.io/)** - Segurança HTTP
- **[Pino](https://getpino.io/)** - Logger de alta performance

### Frontend
- **[Next.js 14](https://nextjs.org/)** - Framework React com App Router
- **[React 18](https://react.dev/)** - Biblioteca JavaScript para UI
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[TailwindCSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Shadcn/ui](https://ui.shadcn.com/)** - Componentes UI modernos
- **[React Hook Form](https://react-hook-form.com/)** - Gerenciamento de formulários
- **[Zod](https://zod.dev/)** - Validação e schema
- **[Axios](https://axios-http.com/)** - Cliente HTTP
- **[Lucide React](https://lucide.dev/)** - Ícones modernos

### Infraestrutura
- **[Docker](https://www.docker.com/)** - Containerização
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestração de containers

## ⚡ Funcionalidades

### 🔐 Autenticação e Autorização
- Login com email e senha
- JWT + Refresh Token
- Controle de acesso baseado em papéis (RBAC)
- 3 níveis de permissão: ADMIN, GESTOR, VISUALIZADOR

### 🏠 Gestão de Imóveis
- Cadastro completo de imóveis (casas, apartamentos, comerciais, terrenos, prédios)
- Suporte a múltiplas unidades (ex: apartamentos em um prédio)
- Informações detalhadas: endereço, matrícula, observações
- Filtros por cidade, estado e tipo

### 👥 Gestão de Inquilinos
- Cadastro completo com CPF, telefone, email
- Histórico de contratos
- Busca e filtros

### 📄 Gestão de Contratos
- Vinculação de imóvel/unidade + inquilino
- Controle de valores, datas e vencimentos
- Índices de reajuste (IPCA, IGP-M, Fixo)
- Tipos de garantia (caução, fiador, seguro fiança)
- Status (ativo, encerrado, cancelado)
- Upload de PDF do contrato

### 💰 Gestão Financeira
- Geração automática de cobranças mensais
- Controle de pagamentos (pago, pendente, atrasado)
- Cálculo automático de juros e multas
- Registro de despesas (IPTU, condomínio, manutenção, etc)
- Dashboard financeiro com indicadores
- Relatórios mensais e anuais

### 🔧 Manutenção
- Abertura de chamados por imóvel/unidade
- Acompanhamento de status
- Registro de custos
- Anexo de fotos e documentos

### 📊 Dashboard e Relatórios
- Visão geral com indicadores principais
- Acompanhamento financeiro em tempo real
- Total recebido vs esperado
- Inadimplência
- Despesas e lucro líquido
- Chamados de manutenção

### 📝 Auditoria
- Registro de todas as ações importantes
- Log de usuário, ação, entidade e detalhes
- Timestamp de cada operação

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **[Docker](https://docs.docker.com/get-docker/)** (versão 20.10 ou superior)
- **[Docker Compose](https://docs.docker.com/compose/install/)** (versão 2.0 ou superior)
- **[Git](https://git-scm.com/)**

> **Nota:** Não é necessário instalar Node.js, PostgreSQL ou outras dependências localmente. Tudo roda via Docker!

## 🔧 Instalação e Execução

### 1. Clone o repositório (se aplicável)

```bash
# Se você tiver o projeto em um repositório Git:
git clone https://github.com/seu-usuario/siga.git
cd siga
```

### 2. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações (opcional)
# As configurações padrão já funcionam para desenvolvimento
```

**Arquivo .env padrão:**
```env
# Database
POSTGRES_USER=siga
POSTGRES_PASSWORD=siga123
POSTGRES_DB=siga_db
DATABASE_URL=postgresql://siga:siga123@postgres:5432/siga_db?schema=public

# Backend
NODE_ENV=development
PORT=3001

# JWT (IMPORTANTE: Mude em produção!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### 3. Inicie os containers Docker

```bash
# Construa e inicie todos os serviços
docker compose up --build
```

> **Primeira execução:** Pode levar alguns minutos para baixar as imagens e construir os containers.

### 4. Aguarde a inicialização

O sistema estará pronto quando você ver estas mensagens:

```
siga-backend    | 🚀 SIGA Backend is running on: http://localhost:3001
siga-backend    | 📚 Swagger documentation: http://localhost:3001/api
siga-frontend   | ✓ Ready in ...
```

### 5. Acesse o sistema

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api/v1
- **Swagger (Documentação da API):** http://localhost:3001/api
- **PostgreSQL:** localhost:5432

## 🔑 Credenciais de Teste

O sistema vem com usuários pré-cadastrados para teste:

### Administrador
- **Email:** admin@siga.com
- **Senha:** admin123
- **Permissões:** Acesso total ao sistema

### Gestor
- **Email:** gestor@siga.com
- **Senha:** gestor123
- **Permissões:** Gerenciar imóveis, inquilinos, contratos e pagamentos

### Visualizador
- **Email:** viewer@siga.com
- **Senha:** viewer123
- **Permissões:** Apenas visualização

## 📁 Estrutura do Projeto

```
siga/
├── backend/                    # Backend NestJS
│   ├── prisma/
│   │   ├── schema.prisma      # Schema do banco de dados
│   │   └── seed.ts            # Dados iniciais
│   ├── src/
│   │   ├── auth/              # Módulo de autenticação
│   │   ├── users/             # Módulo de usuários
│   │   ├── properties/        # Módulo de imóveis
│   │   ├── units/             # Módulo de unidades
│   │   ├── tenants/           # Módulo de inquilinos
│   │   ├── contracts/         # Módulo de contratos
│   │   ├── payments/          # Módulo de pagamentos
│   │   ├── expenses/          # Módulo de despesas
│   │   ├── maintenance/       # Módulo de manutenção
│   │   ├── files/             # Módulo de arquivos
│   │   ├── dashboard/         # Módulo de dashboard
│   │   ├── audit/             # Módulo de auditoria
│   │   ├── common/            # Decorators, guards, etc
│   │   ├── prisma/            # Serviço Prisma
│   │   ├── app.module.ts      # Módulo principal
│   │   └── main.ts            # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Frontend Next.js
│   ├── src/
│   │   ├── app/               # App Router (Next.js 14)
│   │   │   ├── login/         # Página de login
│   │   │   ├── dashboard/     # Dashboard e páginas protegidas
│   │   │   ├── layout.tsx     # Layout principal
│   │   │   └── page.tsx       # Página inicial (redirect)
│   │   ├── components/
│   │   │   └── ui/            # Componentes shadcn/ui
│   │   ├── contexts/
│   │   │   └── auth-context.tsx # Context de autenticação
│   │   └── lib/
│   │       ├── api.ts         # Cliente Axios
│   │       └── utils.ts       # Funções utilitárias
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml         # Orquestração dos containers
├── .env.example               # Exemplo de variáveis de ambiente
├── .gitignore
└── README.md                  # Este arquivo
```

## 🐳 Comandos Docker Úteis

### Iniciar o sistema
```bash
docker compose up
```

### Iniciar em segundo plano
```bash
docker compose up -d
```

### Parar o sistema
```bash
docker compose down
```

### Parar e remover volumes (⚠️ apaga os dados do banco)
```bash
docker compose down -v
```

### Ver logs
```bash
# Todos os serviços
docker compose logs -f

# Apenas o backend
docker compose logs -f backend

# Apenas o frontend
docker compose logs -f frontend
```

### Reconstruir os containers
```bash
docker compose up --build
```

### Acessar o terminal do backend
```bash
docker compose exec backend sh
```

### Executar comandos Prisma
```bash
# Gerar o Prisma Client
docker compose exec backend npx prisma generate

# Criar uma nova migration
docker compose exec backend npx prisma migrate dev --name nome_da_migration

# Rodar o seed novamente
docker compose exec backend npm run prisma:seed

# Abrir o Prisma Studio
docker compose exec backend npx prisma studio
```

## 📚 API Documentation

A documentação completa da API está disponível via Swagger:

**URL:** http://localhost:3001/api

### Principais Endpoints

#### Autenticação
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Renovar token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Dados do usuário autenticado

#### Imóveis
- `GET /api/v1/properties` - Listar todos
- `GET /api/v1/properties/:id` - Buscar por ID
- `POST /api/v1/properties` - Criar novo
- `PATCH /api/v1/properties/:id` - Atualizar
- `DELETE /api/v1/properties/:id` - Remover

#### Inquilinos
- `GET /api/v1/tenants` - Listar todos
- `GET /api/v1/tenants/:id` - Buscar por ID
- `POST /api/v1/tenants` - Criar novo
- `PATCH /api/v1/tenants/:id` - Atualizar
- `DELETE /api/v1/tenants/:id` - Remover

#### Contratos
- `GET /api/v1/contracts` - Listar todos
- `GET /api/v1/contracts/:id` - Buscar por ID
- `POST /api/v1/contracts` - Criar novo
- `PATCH /api/v1/contracts/:id` - Atualizar
- `DELETE /api/v1/contracts/:id` - Remover

#### Pagamentos
- `GET /api/v1/payments` - Listar todos
- `GET /api/v1/payments/:id` - Buscar por ID
- `POST /api/v1/payments` - Criar novo
- `POST /api/v1/payments/:id/mark-as-paid` - Marcar como pago
- `PATCH /api/v1/payments/:id` - Atualizar
- `DELETE /api/v1/payments/:id` - Remover

#### Dashboard
- `GET /api/v1/dashboard/overview` - Visão geral
- `GET /api/v1/dashboard/recent-activity` - Atividades recentes

### Autenticação na API

Todas as rotas (exceto login) requerem o header de autorização:

```
Authorization: Bearer {seu_token_jwt}
```

## 🏗️ Arquitetura

### Backend (NestJS)

O backend segue uma arquitetura modular com separação clara de responsabilidades:

- **Controllers**: Recebem requisições HTTP e retornam respostas
- **Services**: Contêm a lógica de negócio
- **DTOs**: Validação e transformação de dados (usando class-validator)
- **Guards**: Proteção de rotas (JWT + RBAC)
- **Decorators**: Metadados customizados (@CurrentUser, @Roles, @Public)
- **Prisma**: Camada de acesso a dados

### Frontend (Next.js)

O frontend utiliza o App Router do Next.js 14 com:

- **Server Components**: Para páginas estáticas
- **Client Components**: Para interatividade ('use client')
- **Context API**: Gerenciamento de estado de autenticação
- **Axios**: Comunicação com o backend
- **React Hook Form + Zod**: Validação de formulários
- **Shadcn/ui**: Componentes UI acessíveis e customizáveis

### Banco de Dados

Modelo relacional com as seguintes entidades principais:

```
User (usuários do sistema)
Property (imóveis)
Unit (unidades de um imóvel)
Tenant (inquilinos)
Contract (contratos de locação)
Payment (pagamentos)
Expense (despesas)

MaintenanceTicket (chamados de manutenção)
FileUpload (arquivos anexados)
AuditLog (logs de auditoria)
```

### Segurança

- ✅ Senha criptografada com bcrypt
- ✅ JWT com refresh token
- ✅ CORS configurado
- ✅ Helmet para headers de segurança
- ✅ Rate limiting
- ✅ Validação de entrada (class-validator)
- ✅ RBAC (Role-Based Access Control)

## 🚧 Próximas Melhorias

Sugestões para evolução do sistema:

- [ ] Upload real de arquivos com storage (AWS S3, MinIO)
- [ ] Relatórios em PDF
- [ ] Notificações por email
- [ ] Geração automática de boletos
- [ ] Integração com gateways de pagamento
- [ ] App mobile (React Native)
- [ ] Testes automatizados (Jest + Testing Library)
- [ ] CI/CD (GitHub Actions)
- [ ] Monitoramento (Sentry, DataDog)

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvimento

### Tecnologias e Conceitos Aplicados

- ✅ **Clean Architecture**: Separação de camadas e responsabilidades
- ✅ **SOLID Principles**: Código manutenível e escalável
- ✅ **RESTful API**: Padrões de API bem definidos
- ✅ **TypeScript**: Type safety em todo o código
- ✅ **Dependency Injection**: Desacoplamento de dependências (NestJS)
- ✅ **ORM**: Abstração do banco de dados (Prisma)
- ✅ **Migrations**: Controle de versão do schema
- ✅ **Seed**: Dados iniciais para desenvolvimento
- ✅ **Docker**: Containerização e portabilidade
- ✅ **Environment Variables**: Configuração por ambiente

### Padrões de Código

- ESLint + Prettier configurados
- Convenções de nomenclatura consistentes
- Comentários em português quando necessário
- Estrutura de pastas organizada

## 💡 Dicas

### Performance

- O backend usa Pino para logs de alta performance
- O frontend usa Server Components do Next.js quando possível
- Prisma gera queries otimizadas
- Docker usa multi-stage builds para imagens menores

### Desenvolvimento

Para desenvolvimento, você pode rodar os serviços individualmente:

```bash
# Backend (na pasta backend/)
npm install
npm run start:dev

# Frontend (na pasta frontend/)
npm install
npm run dev
```

### Produção

Para deploy em produção:

1. Altere as variáveis de ambiente (especialmente JWT_SECRET)
2. Use HTTPS
3. Configure um domínio
4. Use um serviço de hosting (AWS, DigitalOcean, Heroku, Vercel, etc)
5. Configure backups do banco de dados
6. Implemente monitoramento

## 🆘 Troubleshooting

### Porta já em uso

Se as portas 3000, 3001 ou 5432 já estiverem em uso:

```bash
# Altere as portas no docker-compose.yml
# ou pare os serviços que estão usando essas portas
```

### Erro ao conectar no banco

```bash
# Verifique se o container do postgres está rodando
docker compose ps

# Verifique os logs
docker compose logs postgres
```

### Erro de permissão no Docker

```bash
# Linux: adicione seu usuário ao grupo docker
sudo usermod -aG docker $USER
# Faça logout e login novamente
```

### Limpar tudo e recomeçar

```bash
# Para todos os containers e remove volumes
docker compose down -v

# Remove imagens não utilizadas
docker system prune -a

# Reconstrói tudo do zero
docker compose up --build
```

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique a documentação Swagger: http://localhost:3001/api
2. Consulte os logs: `docker compose logs -f`
3. Abra uma issue no repositório (se aplicável)

---

**Desenvolvido com ❤️ para facilitar a gestão de aluguéis**

Sistema completo, moderno e profissional - Do Excel para a Web! 🚀
