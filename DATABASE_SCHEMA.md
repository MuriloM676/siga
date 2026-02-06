# 📊 Modelo de Dados - SIGA

## Entidades Principais

### 👤 User (Usuários do Sistema)
```typescript
- id: string (UUID)
- email: string (unique)
- password: string (hash bcrypt)
- name: string
- role: ADMIN | GESTOR | VISUALIZADOR
- refreshToken?: string
- isActive: boolean
- createdAt: DateTime
- updatedAt: DateTime
```

**Relacionamentos:**
- 1:N com AuditLog

---

### 🏠 Property (Imóveis)
```typescript
- id: string (UUID)
- type: CASA | APARTAMENTO | COMERCIAL | TERRENO | PREDIO
- name: string
- city: string
- state: string
- address: string
- complement?: string
- zipCode?: string
- registration?: string (matrícula)
- observations?: string
- hasUnits: boolean
- createdAt: DateTime
- updatedAt: DateTime
```

**Relacionamentos:**
- 1:N com Unit (unidades)
- 1:N com Contract (contratos)
- 1:N com Expense (despesas)
- 1:N com MaintenanceTicket (manutenção)
- 1:N com FileUpload (arquivos)

---

### 🏢 Unit (Unidades)
```typescript
- id: string (UUID)
- propertyId: string (FK)
- number: string (ex: "101", "A")
- floor?: string
- area?: float (m²)
- bedrooms?: int
- bathrooms?: int
- parkingSpots?: int
- observations?: string
- createdAt: DateTime
- updatedAt: DateTime
```

**Relacionamentos:**
- N:1 com Property
- 1:N com Contract
- 1:N com MaintenanceTicket
- 1:N com FileUpload

**Constraint:** UNIQUE(propertyId, number)

---

### 👥 Tenant (Inquilinos)
```typescript
- id: string (UUID)
- name: string
- cpf: string (unique)
- phone?: string
- email?: string
- address?: string
- observations?: string
- createdAt: DateTime
- updatedAt: DateTime
```

**Relacionamentos:**
- 1:N com Contract

---

### 📄 Contract (Contratos)
```typescript
- id: string (UUID)
- propertyId: string (FK)
- unitId?: string (FK, opcional)
- tenantId: string (FK)
- startDate: DateTime
- endDate?: DateTime
- rentAmount: float
- dueDay: int (1-31)
- indexType: IPCA | IGP_M | FIXO | NENHUM
- guaranteeType: CAUCAO | FIADOR | SEGURO_FIANCA | NENHUMA
- guaranteeDetails?: string
- status: ATIVO | ENCERRADO | CANCELADO
- observations?: string
- createdAt: DateTime
- updatedAt: DateTime
```

**Relacionamentos:**
- N:1 com Property
- N:1 com Unit (opcional)
- N:1 com Tenant
- 1:N com Payment
- 1:N com FileUpload

---

### 💰 Payment (Pagamentos)
```typescript
- id: string (UUID)
- contractId: string (FK)
- referenceMonth: DateTime (mês de referência)
- dueDate: DateTime
- amount: float
- status: PENDENTE | PAGO | ATRASADO | CANCELADO
- paidDate?: DateTime
- paidAmount?: float
- lateFee?: float (multa)
- interest?: float (juros)
- discount?: float
- observations?: string
- createdAt: DateTime
- updatedAt: DateTime
```

**Relacionamentos:**
- N:1 com Contract

**Constraint:** UNIQUE(contractId, referenceMonth)

---

### 💸 Expense (Despesas)
```typescript
- id: string (UUID)
- propertyId: string (FK)
- type: IPTU | CONDOMINIO | MANUTENCAO | SEGURO | 
        TAXA_IMOBILIARIA | AGUA | LUZ | GAS | OUTROS
- description: string
- amount: float
- dueDate: DateTime
- paidDate?: DateTime
- isPaid: boolean
- referenceMonth: DateTime
- observations?: string
- createdAt: DateTime
- updatedAt: DateTime
```

**Relacionamentos:**
- N:1 com Property
- 1:N com FileUpload

---

### 🔧 MaintenanceTicket (Chamados de Manutenção)
```typescript
- id: string (UUID)
- propertyId: string (FK)
- unitId?: string (FK, opcional)
- title: string
- description: string
- cost?: float
- status: ABERTO | EM_ANDAMENTO | CONCLUIDO | CANCELADO
- reportedAt: DateTime
- completedAt?: DateTime
- observations?: string
- createdAt: DateTime
- updatedAt: DateTime
```

**Relacionamentos:**
- N:1 com Property
- N:1 com Unit (opcional)
- 1:N com FileUpload

---

### 📁 FileUpload (Arquivos)
```typescript
- id: string (UUID)
- fileName: string
- originalName: string
- mimeType: string
- size: int
- path: string
- propertyId?: string (FK, opcional)
- unitId?: string (FK, opcional)
- contractId?: string (FK, opcional)
- expenseId?: string (FK, opcional)
- maintenanceTicketId?: string (FK, opcional)
- uploadedAt: DateTime
```

**Relacionamentos (polimórficos):**
- N:1 com Property
- N:1 com Unit
- N:1 com Contract
- N:1 com Expense
- N:1 com MaintenanceTicket

---

### 📝 AuditLog (Logs de Auditoria)
```typescript
- id: string (UUID)
- userId: string (FK)
- action: string (CREATE, UPDATE, DELETE, LOGIN, etc)
- entity: string (User, Property, Contract, etc)
- entityId?: string
- details?: string (JSON)
- ipAddress?: string
- userAgent?: string
- createdAt: DateTime
```

**Relacionamentos:**
- N:1 com User

---

## Diagrama de Relacionamentos (Simplificado)

```
┌────────────┐
│    User    │
└─────┬──────┘
      │ 1:N
      ▼
┌────────────┐
│  AuditLog  │
└────────────┘

┌────────────┐     1:N     ┌──────────┐
│  Property  │◄────────────┤   Unit   │
└─────┬──────┘             └────┬─────┘
      │ 1:N                     │ 1:N
      │                         │
      ├─────────────┬───────────┼──────┬───────────┐
      │             │           │      │           │
      ▼ 1:N         ▼ 1:N       ▼ 1:N  ▼ 1:N       ▼ 1:N
┌──────────┐  ┌──────────┐ ┌───────────┐ ┌─────────────────┐
│ Contract │  │ Expense  │ │ Contract  │ │ MaintenanceTicket│
└────┬─────┘  └──────────┘ └─────┬─────┘ └─────────────────┘
     │ 1:N                        │ N:1
     │                            │
     │ ┌────────┐ 1:N             │
     └►│Payment │                 │
       └────────┘                 │
                                  │
                            ┌─────┴─────┐
                            │   Tenant  │
                            └───────────┘

                      ┌────────────┐
                      │ FileUpload │ (polimórfico: pode ligar-se a vários)
                      └────────────┘
```

## 🔐 Enums

### Role
```typescript
enum Role {
  ADMIN           // Acesso total
  GESTOR          // Gerenciar imóveis e inquilinos
  VISUALIZADOR    // Apenas visualização
}
```

### PropertyType
```typescript
enum PropertyType {
  CASA
  APARTAMENTO
  COMERCIAL
  TERRENO
  PREDIO
}
```

### ContractStatus
```typescript
enum ContractStatus {
  ATIVO
  ENCERRADO
  CANCELADO
}
```

### GuaranteeType
```typescript
enum GuaranteeType {
  CAUCAO
  FIADOR
  SEGURO_FIANCA
  NENHUMA
}
```

### IndexType
```typescript
enum IndexType {
  IPCA
  IGP_M
  FIXO
  NENHUM
}
```

### PaymentStatus
```typescript
enum PaymentStatus {
  PENDENTE
  PAGO
  ATRASADO
  CANCELADO
}
```

### ExpenseType
```typescript
enum ExpenseType {
  IPTU
  CONDOMINIO
  MANUTENCAO
  SEGURO
  TAXA_IMOBILIARIA
  AGUA
  LUZ
  GAS
  OUTROS
}
```

### MaintenanceStatus
```typescript
enum MaintenanceStatus {
  ABERTO
  EM_ANDAMENTO
  CONCLUIDO
  CANCELADO
}
```

## 📊 Índices e Constraints

### Índices Únicos
- `User.email` - UNIQUE
- `Tenant.cpf` - UNIQUE
- `Unit.(propertyId, number)` - UNIQUE
- `Payment.(contractId, referenceMonth)` - UNIQUE

### Índices de Performance (sugeridos)
- `Property.city` - INDEX
- `Property.state` - INDEX
- `Contract.status` - INDEX
- `Payment.status` - INDEX
- `Payment.dueDate` - INDEX
- `Expense.isPaid` - INDEX
- `AuditLog.createdAt` - INDEX

### Cascatas
- Property → Unit: CASCADE
- Property → Contract: RESTRICT (não pode deletar com contratos)
- Property → Expense: CASCADE
- Property → MaintenanceTicket: CASCADE
- Contract → Payment: CASCADE
- Tenant → Contract: RESTRICT (não pode deletar com contratos)

## 🔍 Queries Importantes

### Dashboard Overview
```typescript
// Agregações necessárias:
- COUNT(Property) → total de imóveis
- COUNT(Contract WHERE status = ATIVO) → contratos ativos
- COUNT(Tenant) → total de inquilinos
- SUM(Payment WHERE status = PAGO) → total recebido
- SUM(Payment WHERE status = PENDENTE) → total pendente
- SUM(Payment WHERE status = ATRASADO) → inadimplência
- SUM(Expense WHERE isPaid = true) → despesas pagas
- COUNT(MaintenanceTicket WHERE status IN [ABERTO, EM_ANDAMENTO])
```

### Cálculo de Juros e Multa
```typescript
// Quando paidDate > dueDate:
daysLate = (paidDate - dueDate) / (24 * 60 * 60 * 1000)
lateFee = amount * 0.02  // 2%
interest = amount * 0.00033 * daysLate  // 0.033% ao dia
```

---

**Este modelo suporta:**
- ✅ Múltiplos tipos de imóveis
- ✅ Imóveis com ou sem unidades
- ✅ Contratos flexíveis
- ✅ Controle financeiro completo
- ✅ Histórico de manutenção
- ✅ Upload de documentos
- ✅ Auditoria completa
- ✅ RBAC integrado

**Otimizado para:**
- Consultas rápidas no dashboard
- Relatórios financeiros
- Busca de inquilinos e imóveis
- Rastreabilidade total
