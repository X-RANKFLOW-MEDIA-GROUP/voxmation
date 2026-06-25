# Server Middleware

## White-Label Middleware (`whitelabel.ts`)

Middleware de multi-tenant com suporte a white-label customizado.

### Funcionalidades

1. **Detecção de Account**
   - Resolve account por subdomain (ex: `clientea.voxmation.com`)
   - Resolve account por custom domain (ex: `acme.com`)
   - Fallback para master account em localhost/main domain
   - Cache em memória (5 minutos) para performance

2. **Branding**
   - Carrega e normaliza dados de branding da conta
   - Injeta via headers HTTP para frontend
   - Suporta cores customizadas, logos, CSS/JS custom

3. **Isolamento Multi-Tenant**
   - `req.accountId` - ID da conta para queries
   - `req.tenantId` - Alias para accountId
   - `req.account` - Dados completos da conta
   - `req.branding` - Dados de branding normalizados

4. **Segurança**
   - Validação de account ativo
   - Checks de features habilitadas
   - RLS no Supabase garante isolamento real

### Uso Básico

```typescript
import { whitelabelMiddleware, requireAccount } from "./middleware/whitelabel";

app.use(whitelabelMiddleware);
app.use(requireAccount); // Para rotas que exigem conta válida

app.get("/api/branding", (req, res) => {
  res.json({
    account: req.account,
    branding: req.branding,
  });
});
```

### Middlewares de Proteção

#### `requireAccount`
Falha se nenhuma conta foi resolvida:
```typescript
app.get("/api/protected", requireAccount, handler);
```

#### `requireActiveAccount`
Falha se conta está inativa:
```typescript
app.get("/api/protected", requireActiveAccount, handler);
```

#### `requireFeature`
Falha se feature não está habilitada no plano:
```typescript
app.get("/api/crm", requireFeature("crm"), handler);
app.post("/api/sms", requireFeature("sms"), handler);
```

### Exemplo: Route com Multi-Tenant

```typescript
app.get("/api/crm/contacts", requireActiveAccount, requireFeature("crm"), async (req, res) => {
  // req.accountId garante isolamento automático
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .eq("account_id", req.accountId);

  res.json({ contacts: data });
});
```

### Cache Management

```typescript
import { clearAccountCache, setCachedAccount } from "./middleware/whitelabel";

// Limpar cache de uma conta (após update)
clearAccountCache(accountId);

// Limpar todo o cache
clearAccountCache();

// Verificar cache
const cached = getCachedAccount("clientea.voxmation.com");
```

### Headers de Resposta

O middleware injeta automaticamente:

```
X-Account-ID: 550e8400-e29b-41d4-a716-446655440000
X-Account-Name: Acme Corp
X-Account-Type: sub
X-Branding-Primary: #37ca37

Cookie: x-account-id=550e8400-e29b-41d4-a716-446655440000
```

### Subdomain Resolution

Suporta múltiplos níveis de subdomains:

- `clientea.voxmation.com` → subdomain: `clientea`
- `staging.clientea.voxmation.com` → subdomain: `staging.clientea`
- `staging.voxmation.com` → subdomain: `staging`
- `voxmation.com` → sem subdomain
- `localhost:3000` → sem subdomain

### Data Flow

```
Request
  ↓
extractSubdomain() → parse hostname
  ↓
resolveAccountFromHostname()
  ├─ Check cache
  ├─ Try subdomain lookup
  ├─ Try custom domain lookup
  ├─ Try master account
  └─ Update cache
  ↓
normalizeBranding() → fill defaults
  ↓
Inject to req.account, req.branding
Attach headers
  ↓
next()
```

### Estrutura do Account

```typescript
{
  id: UUID,
  name: string,                    // Nome da empresa
  type: "master" | "sub",          // Tipo de conta
  parent_account_id?: UUID,        // Pai se for sub-account
  subdomain?: string,              // Subdomain único
  custom_domain?: string,          // Domínio customizado
  
  branding: {
    primary_color?: string,        // Cor primária (#37ca37)
    secondary_color?: string,      // Cor secundária (#188bf6)
    logo_url?: string,             // URL do logo
    company_name?: string,         // Nome da empresa para branding
    custom_css?: string,           // CSS customizado
    ...
  },
  
  settings: {
    features: {
      crm: boolean,                // Feature habilitada?
      marketing: boolean,
      phone: boolean,
      sms: boolean,
      email: boolean,
      reports: boolean
    },
    limits: {
      contacts: number,            // Limite de contatos
      calls_per_month: number,     // Chamadas permitidas
      team_members: number,        // Máx membros da equipe
      ...
    }
  },
  
  plan: "free" | "starter" | "pro" | "enterprise",
  is_active: boolean,
  created_at: timestamp,
  updated_at: timestamp
}
```

## Tenant Middleware (`tenantMiddleware.ts`)

Middleware para autenticação baseada em JWT e extração de contexto do usuário.

### Features

- Valida JWT token
- Carrega informações do usuário
- Associa usuário com account_id
- Extrai role e permissions

### Uso

```typescript
import { tenantMiddleware, requireRole, requirePermission } from "./middleware/tenantMiddleware";

app.use(tenantMiddleware); // Protege todas as rotas

app.post("/api/admin", requireRole("owner", "admin"), handler);
app.post("/api/modify", requirePermission("modify_contacts"), handler);
```

## Rate Limiter Middleware

Proteção contra abuso via rate limiting.

### Uso

```typescript
import { rateLimiter } from "./middleware/rateLimiter";

app.use(rateLimiter);
```

## Order de Middleware

Recomendado:

```typescript
app.use(cors());
app.use(express.json());

// 1. Resolver tenant por hostname
app.use(whitelabelMiddleware);

// 2. Rate limiting (por tenant)
app.use(rateLimiter);

// 3. Autenticação JWT
app.use(tenantMiddleware);

// Rotas...
```

## Exemplos Completos

### Setup Express Completo

```typescript
import express from "express";
import cors from "cors";
import {
  whitelabelMiddleware,
  requireAccount,
  requireFeature,
} from "./middleware/whitelabel";
import { tenantMiddleware, requirePermission } from "./middleware/tenantMiddleware";

const app = express();

// CORS e JSON parsing
app.use(cors());
app.use(express.json());

// White-label: Resolve tenant por hostname
app.use(whitelabelMiddleware);

// Authentication: Valida JWT
app.use((req, res, next) => {
  // Opcionalmente validar JWT
  // Proteger rotas que precisam auth
  next();
});

// Protected routes
app.get("/api/account", requireAccount, (req, res) => {
  res.json({
    account: req.account,
    accountId: req.accountId,
    branding: req.branding,
  });
});

app.get("/api/crm/contacts", 
  requireAccount,
  requireFeature("crm"),
  async (req, res) => {
    // Isolamento automático por req.accountId
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("account_id", req.accountId);

    res.json({ contacts: data });
  }
);

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
```

### Multi-Account API Endpoint

```typescript
app.get("/api/branding", requireAccount, (req, res) => {
  const branding = req.branding;
  const account = req.account;

  res.json({
    success: true,
    account: {
      id: account?.id,
      name: account?.name,
      plan: account?.plan,
    },
    branding: {
      primary_color: branding?.primary_color,
      logo_url: branding?.logo_url,
      company_name: branding?.company_name,
    },
    environment: {
      hostname: req.hostname,
      subdomain: extractSubdomain(req.hostname),
    },
  });
});
```

### Feature Gates

```typescript
// SMS só para plano pro+
app.post("/api/sms/send", 
  requireActiveAccount,
  requireFeature("sms"),
  async (req, res) => {
    // Enviar SMS
  }
);

// Relatórios só para enterprise
app.get("/api/reports", 
  requireActiveAccount,
  requireFeature("reports"),
  async (req, res) => {
    // Gerar relatórios
  }
);
```
