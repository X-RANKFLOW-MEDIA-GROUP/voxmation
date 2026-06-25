# Setup: White-Label Multi-Tenant System

## Quick Start

Integre o middleware white-label no seu servidor Express em 3 passos.

### Passo 1: Instale dependências

```bash
npm install node-cache
# ou
yarn add node-cache
```

### Passo 2: Importe e configure o middleware

```typescript
// server/index.ts
import express from "express";
import cors from "cors";
import { whitelabelMiddleware, requireAccount, requireFeature } from "./middleware/whitelabel";
import { tenantMiddleware } from "./middleware/tenantMiddleware";

const app = express();

// CORS e parsing
app.use(cors());
app.use(express.json());

// 1. White-label: Resolve tenant por hostname
app.use(whitelabelMiddleware);

// 2. Opcional: Autenticação JWT
// app.use(tenantMiddleware);

// 3. Suas rotas agora têm acesso a req.accountId e req.branding
```

### Passo 3: Use em rotas

```typescript
// Rota sem autenticação - apenas detecta tenant
app.get("/api/branding", requireAccount, (req, res) => {
  res.json({ branding: req.branding });
});

// Rota com isolamento de tenant
app.get("/api/contacts", requireAccount, requireFeature("crm"), async (req, res) => {
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .eq("account_id", req.accountId); // ← Isolamento automático

  res.json({ contacts: data });
});
```

## Configuração Completa

### Com autenticação JWT

```typescript
import { tenantMiddleware, requireRole } from "./middleware/tenantMiddleware";

const app = express();

app.use(cors());
app.use(express.json());

// 1. Detectar tenant por hostname
app.use(whitelabelMiddleware);

// 2. Validar JWT (opcional)
// app.use(tenantMiddleware);

// 3. Rotas públicas (sem auth)
app.get("/api/branding", requireAccount, (req, res) => {
  res.json({ branding: req.branding });
});

// 4. Rotas protegidas (com auth)
app.post(
  "/api/admin/settings",
  tenantMiddleware,
  requireRole("owner", "admin"),
  async (req, res) => {
    // Usuário está autenticado e é owner/admin
  }
);
```

### Com configuração customizada

```typescript
import { getWhitelabelConfig } from "./config/whitelabel.config";

const config = getWhitelabelConfig({
  cache: {
    ttl: 10 * 60, // 10 minutos em vez de 5
    enabled: true,
  },
  branding: {
    defaultPrimaryColor: "#FF0000", // Cor customizada
  },
});

console.log("Config:", config);
```

## Estrutura de Diretórios

```
server/
├── middleware/
│   ├── whitelabel.ts          ← PRINCIPAL
│   ├── tenantMiddleware.ts    ← Autenticação
│   ├── rateLimiter.ts         ← Rate limiting
│   └── README.md              ← Documentação
├── config/
│   └── whitelabel.config.ts   ← Configuração
├── types/
│   └── tenant.ts              ← TypeScript types
├── docs/
│   └── TENANT_ISOLATION.md    ← Guia de segurança
├── examples/
│   └── whitelabel-integration.ts ← Exemplo completo
├── tests/
│   └── whitelabel.test.ts     ← Testes unitários
├── index.ts                   ← Server principal
└── SETUP_WHITELABEL.md        ← Este arquivo
```

## Cenários de Uso

### Cenário 1: SaaS Multi-Tenant

```
clientea.voxmation.com → Account A
clienteb.voxmation.com → Account B
clientec.voxmation.com → Account C

Mesma aplicação, dados isolados!
```

**Setup:**
```typescript
app.use(whitelabelMiddleware); // Detecta automaticamente
```

### Cenário 2: Custom Domain

```
crm.acmeincorp.com    → Account "Acme Inc"
crm.customera.com     → Account "Customer A"

(Configurar DNS e accounts.custom_domain)
```

**Setup:**
```typescript
// Adicionar custom_domain em accounts table
// Middleware detecta automaticamente
```

### Cenário 3: Staging/Development

```
localhost:3001         → Master account
staging.dev.localhost  → Sub-account
test.dev.localhost     → Test account
```

**Setup:**
```typescript
// Middleware trata localhost como master
// Use subdomains para diferentes ambientes
```

## Integração com Rotas Existentes

### Exemplo: API CRM

```typescript
import { createTenantApp } from "./examples/whitelabel-integration";
import { Router } from "express";

const crmRouter = Router();

// Todas as rotas herdam req.accountId via middleware
crmRouter.get("/contacts", requireAccount, async (req, res) => {
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .eq("account_id", req.accountId); // ← Isolamento

  res.json(data);
});

// Export para usar em server/index.ts
export default crmRouter;
```

**Em server/index.ts:**
```typescript
import crmRouter from "./routes/crm";

app.use(whitelabelMiddleware); // Antes de rotas!
app.use("/api/crm", crmRouter);
```

### Exemplo: Job Applications

```typescript
// Rotas de aplicação isoladas por tenant
app.post("/api/jobs/apply", requireAccount, upload.single("resume"), async (req, res) => {
  // Salva com account_id automaticamente
  const { data } = await supabase
    .from("job_applications")
    .insert([
      {
        account_id: req.accountId, // ← Isolamento
        job_id: req.body.jobId,
        ...
      }
    ])
    .select();

  res.json(data);
});
```

## Testando Localmente

### 1. Com Subdomains (Docker/Hosts)

```bash
# Editar /etc/hosts
127.0.0.1  localhost
127.0.0.1  clientea.localhost
127.0.0.1  clienteb.localhost

# Rodar servidor
npm run dev:server

# Testar
curl -H "Host: clientea.localhost" http://localhost:3001/api/branding
curl -H "Host: clienteb.localhost" http://localhost:3001/api/branding
```

### 2. Com Query String (fallback)

```typescript
// Para testes sem setup de hosts
app.use((req, res, next) => {
  if (req.query.subdomain) {
    req.hostname = `${req.query.subdomain}.voxmation.com`;
  }
  next();
});
```

### 3. Com curl

```bash
# Account A
curl -H "Host: acmea.voxmation.com" http://localhost:3001/api/branding

# Account B
curl -H "Host: acmeb.voxmation.com" http://localhost:3001/api/branding
```

## Migrando Banco de Dados

Se você tem aplicação existente SEM multi-tenant:

### Passo 1: Executar migration

```bash
supabase migration up
# Executa: 20260624_create_multi_tenant.sql
```

### Passo 2: Criar master account

```sql
INSERT INTO accounts (name, type, subdomain)
VALUES ('Voxmation Master', 'master', 'voxmation');

-- Copiar ID
SELECT id FROM accounts WHERE name = 'Voxmation Master';
```

### Passo 3: Adicionar account_id a tabelas existentes

```sql
-- Para cada tabela multi-tenant
ALTER TABLE contacts ADD COLUMN account_id UUID;

-- Preencher com master account para dados existentes
UPDATE contacts SET account_id = (
  SELECT id FROM accounts WHERE type = 'master' LIMIT 1
) WHERE account_id IS NULL;

-- Tornar NOT NULL
ALTER TABLE contacts ALTER COLUMN account_id SET NOT NULL;

-- Adicionar constraint
ALTER TABLE contacts ADD CONSTRAINT contacts_account_fk
  FOREIGN KEY (account_id) REFERENCES accounts(id);
```

### Passo 4: Ativar RLS

```sql
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_isolation" ON contacts
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );
```

## Troubleshooting

### Problema: "Account not found"

```
GET /api/contacts
Error: No account found for hostname
```

**Solução:**
1. Verifique se account existe no Supabase
2. Verifique se subdomain está correto
3. Verifique se account está ativo (is_active = true)

```typescript
// Debug: Adicione logging
app.use((req, res, next) => {
  console.log(`Hostname: ${req.hostname}`);
  console.log(`Account: ${req.accountId}`);
  next();
});
```

### Problema: Cache desatualizado

```typescript
// Clear cache manualmente
import { clearAccountCache } from "./middleware/whitelabel";

// Após atualizar account
clearAccountCache(accountId);

// Ou limpar tudo
clearAccountCache();
```

### Problema: CORS com múltiplos domínios

```typescript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedDomains = [
      "voxmation.com",
      "acmea.com",
      "acmeb.com",
      // ou pattern
    ];

    const allowed = !origin || // Always allow no-origin (mobile, Postman)
      allowedDomains.some(domain => origin?.includes(domain));

    if (allowed) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
};

app.use(cors(corsOptions));
```

### Problema: RLS rejeita queries

```
Error: new row violates row-level security policy
```

**Causa:** RLS ativado mas policy incorreta

**Solução:**
```sql
-- Verificar policies
SELECT * FROM pg_policies WHERE tablename = 'contacts';

-- Recriar policy
DROP POLICY IF EXISTS "contacts_isolation" ON contacts;

CREATE POLICY "contacts_isolation" ON contacts
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );
```

## Monitoramento

### Adicionar logging

```typescript
import { whitelabelMiddleware } from "./middleware/whitelabel";

app.use((req, res, next) => {
  if (req.accountId) {
    console.log(`[TENANT] ${req.accountId} | ${req.method} ${req.path}`);
  }
  next();
});
```

### Métricas úteis

```typescript
app.get("/metrics", (req, res) => {
  res.json({
    accounts: getMetrics().uniqueAccounts,
    requests: getMetrics().totalRequests,
    errors: getMetrics().errorCount,
    cacheSize: getCacheStats(),
  });
});
```

## Segurança: Checklist

- [ ] RLS ativado em todas as tabelas multi-tenant
- [ ] Todas as queries filtram por `account_id`
- [ ] Middleware `requireAccount` aplicado a rotas protegidas
- [ ] CORS configurado para múltiplos domínios
- [ ] JWT validado com `tenantMiddleware` (se usado)
- [ ] Logs de auditoria implementados
- [ ] Testes de isolamento de tenant
- [ ] Backup strategy por tenant
- [ ] Rate limiting por tenant (não global)
- [ ] Docs de segurança revisadas

## Deployment

### Checklist pre-deploy

```bash
# 1. Rodar testes
npm run test

# 2. Verificar migrations
supabase migration list

# 3. Validar configuração
echo $VITE_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# 4. Build
npm run build

# 5. Deploy
# Your deployment command here
```

### Environment Variables

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secret-key

# Optional
CACHE_TTL=300
CACHE_ENABLED=true
LOG_VERBOSE=false
REQUIRE_ACTIVE_ACCOUNT=true
VALIDATE_HOSTNAME=true
```

## Próximos Passos

1. **Implementar RLS** - Garante isolamento no banco
2. **Testes de isolamento** - Verifique cross-tenant leaks
3. **Documentar endpoints** - Marque quais são multi-tenant
4. **Monitorar performance** - Cache e índices
5. **Audit logging** - Rastrear mudanças por tenant

## Recursos

- [Documentação completa](./middleware/README.md)
- [Guia de isolamento](./docs/TENANT_ISOLATION.md)
- [Tipos TypeScript](./types/tenant.ts)
- [Exemplo de implementação](./examples/whitelabel-integration.ts)
- [Configuração](./config/whitelabel.config.ts)

## Support

Para dúvidas sobre multi-tenant:
1. Verifique [TENANT_ISOLATION.md](./docs/TENANT_ISOLATION.md)
2. Revise exemplos em [examples/](./examples/)
3. Execute testes: `npm test`
4. Adicione debug logging conforme necessário
