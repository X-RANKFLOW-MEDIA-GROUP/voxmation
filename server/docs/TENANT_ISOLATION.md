# Multi-Tenant Isolation Guide

## Visão Geral

Este documento descreve como o sistema garante isolamento completo entre tenants no Voxmation.

## Camadas de Isolamento

### 1. Detecção de Tenant (Middleware)

**Arquivo:** `server/middleware/whitelabel.ts`

O middleware detecta o tenant resolvendo a conta a partir do hostname:

```
Requisição HTTP
  ↓
Extrai hostname (ex: clientea.voxmation.com)
  ↓
Resolve account por:
  1. Subdomain (clientea)
  2. Custom domain (acme.com)
  3. Master account (fallback)
  ↓
Injeta em req.accountId (ID única da conta)
```

**Segurança:** Mesmo se um cliente acessar via IP direto ou host falsificado, o domínio será inválido e nenhuma conta será resolvida.

### 2. Row-Level Security (RLS) - Banco de Dados

**Arquivo:** `supabase/migrations/20260624_create_multi_tenant.sql`

O Supabase RLS garante isolamento no nível de linha:

```sql
-- Exemplo: Política RLS para contatos
CREATE POLICY "contacts_tenant_isolation" ON contacts
  FOR SELECT
  USING (account_id = auth.uid()::UUID);

-- Usuário só vê dados da sua conta
SELECT * FROM contacts
-- Filtra automaticamente onde account_id = current_user_account_id
```

**Importante:** Cada tabela multi-tenant deve ter:

```sql
-- 1. Coluna account_id
CREATE TABLE contacts (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id),
  name TEXT,
  ...
);

-- 2. Índice em account_id para performance
CREATE INDEX idx_contacts_account_id ON contacts(account_id);

-- 3. RLS Policy
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_select" ON contacts
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );
```

### 3. Verificação em Nível de Aplicação

**Arquivo:** `server/middleware/whitelabel.ts`

O middleware injeta `req.accountId` em cada requisição:

```typescript
// req.accountId = "550e8400-e29b-41d4-a716-446655440000"

// CORRETO: Query isolada por tenant
const { data } = await supabase
  .from("contacts")
  .select("*")
  .eq("account_id", req.accountId); // ✓ Isolado

// ERRADO: Vaza dados de todos os tenants
const { data } = await supabase
  .from("contacts")
  .select("*"); // ✗ Sem isolamento!
```

## Checklist de Segurança para Novas Rotas

Quando criar uma nova rota multi-tenant:

### 1. Definir tabela com account_id

```sql
CREATE TABLE features (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id),
  data JSONB,
  ...
);

CREATE INDEX idx_features_account ON features(account_id);
```

### 2. Implementar RLS Policy

```sql
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "features_select" ON features
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );
```

### 3. Aplicar middleware na rota

```typescript
app.get(
  "/api/features",
  requireAccount,           // ✓ Valida tenant
  requireFeature("feature"), // ✓ Verifica habilitação
  async (req, res) => {
    // req.accountId garantido não-null
  }
);
```

### 4. Filtrar SEMPRE por account_id

```typescript
// ✓ BOM
const { data } = await supabase
  .from("features")
  .select("*")
  .eq("account_id", req.accountId!);

// ✗ RUIM
const { data } = await supabase
  .from("features")
  .select("*");

// ✗ PÉSSIMO
const { data } = await supabase
  .from("features")
  .select("*")
  .eq("user_id", req.userId); // User pode estar em múltiplas contas!
```

## Scenario: Cross-Account Data Leak

### Cenário de Ataque

1. Usuário A acessa `clientea.voxmation.com`
2. Usuário B acessa `clienteb.voxmation.com`
3. Ambos acessam mesma rota `/api/contacts`
4. Se rota não filtrar por account_id → Usuário A vê contatos de B!

### Proteções Implementadas

#### Proteção 1: Hostname Resolution
```typescript
// Se usuário A tenta acessar clienteb.voxmation.com
// req.accountId será carregado como account_b
// Mesmo sem filtro no código, acessaria dados de B
// (Não é ideal, mas evita acesso cruzado dentro de rota)
```

#### Proteção 2: Middleware Validation
```typescript
requireAccount // Falha se req.accountId não existe
```

#### Proteção 3: RLS Enforcement
```sql
-- Banco de dados REJEITA query sem filtro
-- Mesmo que código tenha bug
```

#### Proteção 4: Code Review
```
// SEMPRE revisar novas queries:
.eq("account_id", req.accountId) // Presente?
```

## Testing Tenant Isolation

### 1. Unit Tests

```typescript
describe("Tenant Isolation", () => {
  it("should only return contacts for current account", async () => {
    const req = createMockRequest() as Request;
    req.accountId = "account-1";

    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("account_id", req.accountId);

    // Assert all contacts belong to account-1
    expect(data).not.toContainEqual(
      expect.objectContaining({ account_id: "account-2" })
    );
  });
});
```

### 2. Integration Tests

```typescript
it("should prevent cross-account access", async () => {
  // Login as user from account-1
  const res1 = await fetch("http://account1.voxmation.com/api/contacts");
  const contacts1 = await res1.json();

  // Login as user from account-2
  const res2 = await fetch("http://account2.voxmation.com/api/contacts");
  const contacts2 = await res2.json();

  // Ensure no overlap
  const ids1 = contacts1.map(c => c.id);
  const ids2 = contacts2.map(c => c.id);
  const overlap = ids1.filter(id => ids2.includes(id));

  expect(overlap).toHaveLength(0); // No shared contacts
});
```

### 3. Manual Testing

```bash
# Terminal 1: Account A
curl -H "Host: acmea.voxmation.com" http://localhost:3001/api/contacts

# Terminal 2: Account B
curl -H "Host: acmeb.voxmation.com" http://localhost:3001/api/contacts

# Verify different results
```

## Dados Seguros por Padrão

### O que é automaticamente isolado:

✓ Todos os dados em tabelas com `account_id`
✓ RLS policies do Supabase
✓ `req.accountId` disponível em toda rota
✓ Cache por subdomain (não vaza entre accounts)
✓ Uploads por tenant (se implementados)
✓ Logs de auditoria por tenant

### O que NÃO é automaticamente isolado:

✗ System tables (auth, functions, etc)
✗ Dados públicos proposital (configuração do main domain)
✗ Analytics agregados (se compartilhar dados)
✗ Backups (mantém estrutura da conta)

## Common Mistakes

### Mistake 1: Esquecer account_id na query

```typescript
// ✗ ERRADO
const { data } = await supabase
  .from("contacts")
  .select("*")
  .eq("user_id", req.userId);
```

**Por quê?** Um usuário pode estar em múltiplas contas. Precisa filtrar por account_id também.

**Correção:**
```typescript
// ✓ CORRETO
const { data } = await supabase
  .from("contacts")
  .select("*")
  .eq("account_id", req.accountId)
  .eq("user_id", req.userId);
```

### Mistake 2: RLS não ativado

```sql
-- ✗ ERRADO
CREATE TABLE contacts (...);
-- RLS não habilitado!

-- ✓ CORRETO
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_isolation" ON contacts
  USING (account_id = auth.uid()::UUID);
```

### Mistake 3: Cache sem tenant-awareness

```typescript
// ✗ ERRADO
const cache = new Map();
cache.set("contacts", data); // Qual account?

// ✓ CORRETO
cache.set(`contacts:${req.accountId}`, data);
```

### Mistake 4: Não validar host em requisições cruzadas

```typescript
// ✗ ERRADO
app.post("/api/contacts", async (req, res) => {
  // Não verifica hostname
  const accountId = req.body.accountId; // Cliente pode mentir!
});

// ✓ CORRETO
app.post("/api/contacts", requireAccount, async (req, res) => {
  // req.accountId vem do middleware, não do cliente
  const accountId = req.accountId;
});
```

## Performance Considerations

### Índices Importantes

```sql
-- Todos os queries filtram por account_id
CREATE INDEX idx_contacts_account_id ON contacts(account_id);

-- Se filtrar por múltiplos campos
CREATE INDEX idx_contacts_account_user 
  ON contacts(account_id, user_id);

-- Para ordenação
CREATE INDEX idx_contacts_account_created 
  ON contacts(account_id, created_at DESC);
```

### Query Optimization

```typescript
// ✗ LENTO: Carrega todos, depois filtra
const { data } = await supabase
  .from("contacts")
  .select("*"); // Todas as contas
const filtered = data.filter(c => c.account_id === req.accountId);

// ✓ RÁPIDO: Filtra no banco
const { data } = await supabase
  .from("contacts")
  .select("*")
  .eq("account_id", req.accountId);
```

## Auditoria e Logs

Recomendado: Logar todas as queries multi-tenant

```typescript
// Middleware de logging
app.use((req, res, next) => {
  if (req.accountId) {
    console.log(`[${req.accountId}] ${req.method} ${req.path}`);
  }
  next();
});

// Em queries
const { data, error } = await supabase
  .from("contacts")
  .select("*")
  .eq("account_id", req.accountId);

if (error) {
  console.error(`Query error for account ${req.accountId}:`, error);
}
```

## Recuperação de Desastres

### Cenário: RLS acidentalmente desabilitado

```sql
-- PROBLEMA
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
-- Agora SELECT * retorna TODOS os dados

-- SOLUÇÃO
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
-- Reativar todas as policies
```

### Cenário: Dados em tabela sem account_id

```sql
-- PROBLEMA
CREATE TABLE legacy_data (
  id UUID PRIMARY KEY,
  value TEXT
  -- Sem account_id!
);

-- SOLUÇÃO
ALTER TABLE legacy_data ADD COLUMN account_id UUID;
-- Migrar dados com ALTER SET NOT NULL
```

## Recursos

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Multi-Tenant Architecture Guide](https://docs.supabase.com/guides/solutions/multi-tenancy)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## Checklist de Deploy

- [ ] Todas as tabelas têm `account_id`
- [ ] RLS ativado em todas as tabelas
- [ ] Índices criados em `account_id`
- [ ] Queries testadas com múltiplos accounts
- [ ] Middlewares aplicados a rotas sensíveis
- [ ] Nenhuma query sem `.eq("account_id", ...)`
- [ ] Testes de isolamento implementados
- [ ] Logs de auditoria funcionando
- [ ] Documentação atualizada
- [ ] Code review realizado
