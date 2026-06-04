# Odontotech

Sistema de gestão para clínicas odontológicas, full-stack, desenvolvido em Node.js + React. O backend serve o próprio frontend estático, de modo que toda a aplicação roda em um único processo e uma única origem.

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Licença](https://img.shields.io/badge/Licença-MIT-blue)

---

## Índice

- [Funcionalidades](#funcionalidades)
- [Stack Técnica](#stack-técnica)
- [Arquitetura](#arquitetura)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Como Rodar](#como-rodar)
- [Credenciais de Demonstração](#credenciais-de-demonstração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Endpoints da API](#endpoints-da-api)
- [Modelos de Dados](#modelos-de-dados)
- [Frontend — Notas Importantes](#frontend--notas-importantes)

---

## Funcionalidades

- **Landing page** pública com telas de login e registro.
- **Dashboard** com KPIs em tempo real (total de pacientes, consultas do dia, exames pendentes), agenda do dia, atividade recente e gráfico de consultas da semana.
- **Agenda / Agendamento** — calendário com visões Mês, Semana e Dia; eventos coloridos por status; filtro por dentista; modal de detalhes com transições de status (agendado → confirmado → concluído / cancelado); formulário de nova consulta com busca de paciente, seleção de procedimento, dentista, data, horário e resumo com valor estimado.
- **Pacientes** — listagem com busca, filtros, ordenação e paginação; cadastro e edição em stepper de 4 etapas (dados pessoais, contato, saúde, revisão); ficha completa com histórico de consultas, dados de saúde (alergias, condições, observações) e campo de responsável legal para menores.
- **Exames** — listagem, visualização com anexos e laudo, criação e edição com upload real de arquivos (JPG, PNG, PDF, WEBP, DICOM).
- **Catálogo de serviços** — cards com categoria, preço e duração; criação, edição e exclusão; associação de serviços a uma consulta.
- **Planos / convênios** — tabela com cobertura percentual, carência e status; criação, edição, exclusão e ativação.
- **Configurações** — sub-abas Clínica (dados cadastrais), Equipe (gestão de usuários ADMIN/DENTIST), Agenda (horário de funcionamento, intervalo de slots, fuso horário) e Design System embutido. Painel de Tweaks para tema (claro/escuro), cor primária, cantos e densidade.

---

## Stack Técnica

### Backend
| Tecnologia | Versão | Função |
|---|---|---|
| Node.js | 18+ (recomendado 20+) | Runtime |
| TypeScript | ^5.7 | Tipagem estática |
| Express | ^4.21 | Framework HTTP |
| Prisma | ^5.22 | ORM |
| SQLite | — | Banco de dados (arquivo único) |
| jsonwebtoken | ^9.0 | Tokens JWT (access + refresh) |
| bcryptjs | ^2.4 | Hash de senhas |
| Zod | ^3.24 | Validação de entrada |
| Multer | ^1.4 | Upload de arquivos |
| cors, dotenv | — | CORS e variáveis de ambiente |
| ts-node-dev | ^2.0 | Hot-reload no desenvolvimento |

### Frontend
| Tecnologia | Versão | Função |
|---|---|---|
| React | 18 (UMD via CDN) | UI |
| Babel Standalone | CDN | Transpilação JSX no browser |
| CSS puro | — | Estilos (sem pré-processador) |
| Inter / JetBrains Mono | Google Fonts | Tipografia |

> O frontend não possui etapa de build. Os arquivos `.jsx` são carregados diretamente no browser e transpilados em tempo de execução pelo Babel Standalone. Veja a seção [Frontend — Notas Importantes](#frontend--notas-importantes).

---

## Arquitetura

```
Browser ──► GET /Odontotech.html ──► Express (estático)
                │
                ├─ api.js detecta origem e aponta para a mesma URL base
                │
Browser ──► fetch /auth, /patients, ... ──► Express (rotas da API)
                │
                ├─ Middlewares: CORS → JSON parse → authenticate → authorize
                ├─ Controller → Service → Prisma Client → dev.db (SQLite)
                └─ Resposta padrão: { success, data, message? }
```

### Módulos do backend

Cada feature tem sua própria pasta em `src/modules/` com os arquivos `controller.ts`, `router.ts`, `schema.ts` (Zod), `service.ts` e `types.ts`.

| Módulo | Responsabilidade |
|---|---|
| `auth` | Login, logout, refresh de token, perfil |
| `patients` | CRUD de pacientes |
| `appointments` | CRUD de consultas, agenda, transições de status, serviços associados |
| `services` | Catálogo de procedimentos odontológicos |
| `plans` | Planos e convênios |
| `exams` | Exames e upload de arquivos |
| `dental-records` | Prontuário do paciente (1:1) |
| `config` | Configurações da clínica e gestão de usuários |

### Padrão de resposta da API

```json
// Sucesso simples
{ "success": true, "data": { ... }, "message": "..." }

// Lista paginada
{ "success": true, "data": [...], "total": 47, "page": 1, "totalPages": 5 }

// Erro
{ "success": false, "message": "Descrição do erro", "error": "..." }
```

### Autenticação

- **Access token** (JWT de curta duração, padrão: `15m`) enviado no header `Authorization: Bearer <token>`.
- **Refresh token** (longa duração, padrão: `7 dias`) persistido no banco de dados, permitindo rotação e revogação.
- O cliente `api.js` renova automaticamente o access token ao receber `401`.
- Roles: `ADMIN` e `DENTIST`. Dentistas são `User` com `role = "DENTIST"`. Administradores têm acesso total.

---

## Estrutura de Pastas

```
Odontotech/
├── .gitignore
├── README.md
│
├── backend/                          # API REST (Express + Prisma + SQLite)
│   ├── src/
│   │   ├── app.ts                    # Criação do app Express, rotas e middlewares
│   │   ├── server.ts                 # Ponto de entrada (listen)
│   │   ├── config/
│   │   │   └── env.ts                # Leitura e validação de variáveis de ambiente
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts    # authenticate / authorize
│   │   │   ├── error.middleware.ts   # Tratamento centralizado de erros
│   │   │   └── upload.middleware.ts  # Configuração do Multer
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── patients/
│   │   │   ├── appointments/
│   │   │   ├── services/
│   │   │   ├── plans/
│   │   │   ├── exams/
│   │   │   ├── dental-records/
│   │   │   └── config/
│   │   └── shared/
│   │       ├── async-handler.ts      # Wrapper para controllers assíncronos
│   │       └── response.ts           # Helpers ok() / fail()
│   ├── prisma/
│   │   ├── schema.prisma             # Modelos de dados
│   │   ├── seed.ts                   # Dados de demonstração
│   │   └── migrations/
│   ├── uploads/                      # Arquivos enviados (não versionado)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                         # SPA estática (React 18 via CDN)
    ├── Odontotech.html               # Ponto de entrada único
    ├── api.js                        # Cliente HTTP (window.API)
    ├── data.js                       # Dados mock e defaults (window.DATA)
    ├── app.jsx                       # Roteador e estado global
    ├── layout.jsx                    # Shell: sidebar, topbar
    ├── ui.jsx                        # Componentes reutilizáveis
    ├── icons.jsx                     # Ícones SVG próprios
    ├── tweaks-panel.jsx              # Painel de personalização visual
    ├── styles.css                    # Estilos globais
    ├── screens_landing.jsx           # Landing, login e registro
    ├── screens_dashboard.jsx         # Dashboard e KPIs
    ├── screens_agenda.jsx            # Calendário e agendamento
    ├── screens_patients.jsx          # Listagem e ficha de pacientes
    ├── screens_exams.jsx             # Exames e uploads
    ├── screens_catalog.jsx           # Catálogo de serviços e planos
    ├── screens_settings.jsx          # Configurações da clínica
    └── screens_design.jsx            # Design system embutido
```

---

## Como Rodar

### Pré-requisitos

- **Node.js 18+** (recomendado 20+) — [nodejs.org](https://nodejs.org)
- **npm** (incluído com o Node.js)

### Passo a passo

**1. Acesse a pasta do backend**

```bash
cd backend
```

**2. Instale as dependências**

```bash
npm install
```

**3. Configure as variáveis de ambiente**

Copie o arquivo de exemplo e ajuste os valores:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Edite o `.env` e troque os valores de `JWT_SECRET` e `JWT_REFRESH_SECRET` por strings longas e aleatórias. Os demais valores padrão funcionam para desenvolvimento local.

**4. Gere o Prisma Client e aplique o schema**

Execute os dois comandos abaixo (apenas na primeira vez ou após alterar o `schema.prisma`):

```bash
npm run prisma:generate
npm run prisma:migrate
```

**5. Popule o banco com dados de demonstração**

```bash
npm run seed
```

O seed cria 47 pacientes, 10 serviços odontológicos, 6 planos/convênios, 4 dentistas e diversas consultas e exames de exemplo.

**6. Inicie o servidor**

```bash
npm run dev
```

**7. Acesse no navegador**

```
http://localhost:4000
```

O servidor redireciona `/` para `/Odontotech.html` automaticamente.

---

## Credenciais de Demonstração

As credenciais abaixo são criadas pelo `npm run seed`:

| Usuário | E-mail | Senha | Papel |
|---|---|---|---|
| Administrador | `admin@odontotech.com` | `admin123` | ADMIN |
| Marina Costa | `marina.costa@odontotech.com.br` | `demo1234` | ADMIN |

Os dentistas criados pelo seed têm suas próprias credenciais no banco, mas não são expostos como conta de login separada no arquivo de exemplo acima. Faça login com qualquer uma das contas ADMIN para acessar todas as funcionalidades.

---

## Variáveis de Ambiente

Arquivo: `backend/.env` (baseado em `backend/.env.example`)

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `4000` | Porta em que o servidor escuta |
| `DATABASE_URL` | `file:./dev.db` | Caminho do arquivo SQLite |
| `JWT_SECRET` | *(obrigatório)* | Segredo para assinar o access token |
| `JWT_REFRESH_SECRET` | *(obrigatório)* | Segredo para assinar o refresh token |
| `JWT_ACCESS_EXPIRES` | `15m` | Tempo de expiração do access token |
| `JWT_REFRESH_EXPIRES_DAYS` | `7` | Validade do refresh token em dias |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem(s) permitida(s) pelo CORS, separadas por vírgula |
| `UPLOAD_DIR` | `uploads` | Pasta onde os arquivos enviados são armazenados |
| `MAX_UPLOAD_MB` | `20` | Tamanho máximo por arquivo em MB |

> **Atenção:** nunca versione o arquivo `.env` com segredos reais. O `.gitignore` já protege `.env`, `node_modules`, `*.db`, `uploads/` e `.claude/`.

---

## Scripts Disponíveis

Execute os scripts a partir da pasta `backend/`:

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento com hot-reload (ts-node-dev) |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm start` | Inicia o servidor compilado em modo produção (`node dist/server.js`) |
| `npm run prisma:generate` | Gera o Prisma Client a partir do schema |
| `npm run prisma:migrate` | Aplica as migrações e cria/atualiza o banco |
| `npm run prisma:studio` | Abre o Prisma Studio (interface visual do banco) |
| `npm run seed` | Popula o banco com dados de demonstração |
| `npm run db:reset` | Apaga e recria o banco do zero (executa `prisma migrate reset --force`) |

---

## Endpoints da API

Base URL: `http://localhost:4000`

Todas as rotas, exceto `/auth/login`, `/auth/refresh` e `/health`, exigem o header `Authorization: Bearer <accessToken>`.

### Autenticação — `/auth`

| Método | Rota | Corpo | Descrição |
|---|---|---|---|
| `POST` | `/auth/login` | `{ email, password }` | Retorna `accessToken`, `refreshToken` e `user` |
| `POST` | `/auth/refresh` | `{ refreshToken }` | Renova o access token |
| `POST` | `/auth/logout` | `{ refreshToken }` | Revoga o refresh token |
| `GET` | `/auth/me` | — | Retorna o perfil do usuário autenticado |

### Pacientes — `/patients`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/patients` | Lista pacientes (query: `search`, `status`, `planId`, `sort`, `dir`, `page`, `limit`) |
| `POST` | `/patients` | Cria um paciente |
| `GET` | `/patients/:id` | Retorna um paciente pelo ID |
| `PUT` | `/patients/:id` | Atualiza um paciente |
| `DELETE` | `/patients/:id` | Remove um paciente |

### Consultas — `/appointments`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/appointments/agenda` | Lista consultas para o calendário (query: `start`, `end`, `dentistId`) |
| `GET` | `/appointments` | Lista consultas |
| `POST` | `/appointments` | Cria uma consulta |
| `GET` | `/appointments/:id` | Retorna uma consulta pelo ID |
| `PUT` | `/appointments/:id` | Atualiza uma consulta |
| `DELETE` | `/appointments/:id` | Remove uma consulta |
| `PATCH` | `/appointments/:id/status` | Transição de status: `{ status }` |
| `POST` | `/appointments/:id/services` | Associa serviços a uma consulta |

### Serviços — `/services`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/services` | Lista serviços |
| `POST` | `/services` | Cria um serviço |
| `PUT` | `/services/:id` | Atualiza um serviço |
| `DELETE` | `/services/:id` | Remove um serviço |

### Planos — `/plans`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/plans` | Lista planos |
| `POST` | `/plans` | Cria um plano |
| `PUT` | `/plans/:id` | Atualiza um plano |
| `DELETE` | `/plans/:id` | Remove um plano |

### Exames — `/exams` e `/patients/:id/exams`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/exams` | Lista todos os exames |
| `GET` | `/patients/:id/exams` | Lista exames de um paciente |
| `POST` | `/patients/:id/exams` | Cria exame com upload de arquivos (`multipart/form-data`, campo `files`, máx. 10 arquivos) |
| `PUT` | `/exams/:id` | Atualiza exame (aceita novos arquivos via `multipart/form-data`) |
| `DELETE` | `/exams/:id` | Remove um exame |

Os arquivos enviados ficam disponíveis em `/uploads/<filename>`.

### Configurações — `/config`

| Método | Rota | Requer | Descrição |
|---|---|---|---|
| `GET` | `/config` | Autenticado | Retorna configurações da clínica |
| `PUT` | `/config` | ADMIN | Atualiza configurações da clínica |
| `GET` | `/config/dentists` | Autenticado | Lista dentistas (para dropdowns) |
| `GET` | `/config/users` | ADMIN | Lista usuários do sistema |
| `POST` | `/config/users` | ADMIN | Cria um usuário |
| `PUT` | `/config/users/:id` | ADMIN | Atualiza um usuário |
| `DELETE` | `/config/users/:id` | ADMIN | Remove um usuário |

### Utilitários

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Status do servidor e uptime |
| `GET` | `/api` | Informações da API (nome, versão, status) |
| `GET` | `/dentists` | Alias de `/config/dentists` para os dropdowns do frontend |

---

## Modelos de Dados

Definidos em `backend/prisma/schema.prisma` (SQLite — sem suporte a enums nativos; roles e status são strings validadas pelo Zod).

| Modelo | Descrição |
|---|---|
| `User` | Usuários do sistema. Dentistas são `User` com `role = "DENTIST"` |
| `RefreshToken` | Refresh tokens persistidos para rotação e revogação |
| `Plan` | Planos e convênios odontológicos |
| `Patient` | Pacientes. `allergies` e `conditions` armazenados como JSON string |
| `Service` | Serviços / procedimentos odontológicos |
| `Appointment` | Consultas. Status: `agendado \| confirmado \| concluido \| cancelado \| atendimento` |
| `AppointmentService` | Join table: serviços associados a uma consulta (com override de preço e quantidade) |
| `Exam` | Exames (radiografias, tomografias, etc.). Status: `pendente \| concluido` |
| `ExamFile` | Arquivos individuais anexados a um exame |
| `DentalRecord` | Prontuário clínico (relação 1:1 com `Patient`) |
| `ClinicSettings` | Configurações da clínica (linha singleton com `id = "singleton"`) |

---

## Frontend — Notas Importantes

O frontend é um **protótipo SPA estático** e possui características intencionais que diferem de uma aplicação React convencional:

- **Sem etapa de build.** Os arquivos `.jsx` são carregados diretamente no browser e transpilados em tempo de execução pelo Babel Standalone (via CDN). Isso é adequado para prototipagem, mas não é recomendado para produção em alta escala.
- **React 18 via CDN (UMD).** Nenhum bundler (Vite, Webpack, etc.) é utilizado.
- **Ponto de entrada único:** `frontend/Odontotech.html`.
- **Cliente de API (`api.js`):** expõe `window.API` e detecta a origem automaticamente. Se aberto de uma porta diferente de `4000`, aponta para `http://localhost:4000`. É possível sobrescrever isso via `localStorage.setItem('odt-api', 'http://outro-host:4000')`.
- **Forma recomendada de execução:** deixar o próprio backend Express servir o frontend (mesma origem, sem configuração de CORS adicional). Acesse `http://localhost:4000`.
- **Alternativa:** servir a pasta `frontend/` com qualquer servidor estático (ex.: `npx serve frontend`), mas nesse caso o CORS_ORIGIN do backend deve incluir a origem usada.

---

## Licença

MIT — veja o campo `license` em `backend/package.json`.
