# Sistema de Trial de 7 Dias - Guia de Configuração

## Visão Geral

O sistema de trial de 7 dias da Voxmation permite que novos usuários testem o serviço com acesso completo por 7 dias, usando vozes realistas do ElevenLabs.

## Componentes

### 1. Banco de Dados (Supabase)

#### Tabelas Criadas:
- **trials**: Armazena informações dos trials de cada lead
- **api_keys**: Armazena as chaves de API geradas para cada trial

#### Schema:
```sql
-- trials
- id (UUID, PK)
- lead_id (UUID, FK -> website_leads)
- email (VARCHAR)
- business_name (VARCHAR)
- industry (VARCHAR)
- status (VARCHAR) - active, expired, converted, cancelled
- started_at (TIMESTAMP)
- expires_at (TIMESTAMP) - +7 dias
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

-- api_keys
- id (UUID, PK)
- trial_id (UUID, FK -> trials)
- api_key (VARCHAR, UNIQUE)
- elevenlabs_key (VARCHAR)
- status (VARCHAR) - active, revoked
- created_at (TIMESTAMP)
- last_used_at (TIMESTAMP)
```

### 2. Serviços

#### `trial-service.ts`
Funções principais:
- `createTrial()`: Cria um novo trial e gera a chave de API
- `validateApiKey()`: Valida uma chave de API
- `getTrial()`: Recupera informações do trial

#### `api-key-generator.ts`
Funções para gerar chaves:
- `generateApiKey()`: Gera uma chave de API única
- `generateTrialToken()`: Gera um token seguro
- `maskApiKey()`: Mascara a chave para exibição

#### `email-service.ts`
Funções para enviar emails:
- `sendTrialEmail()`: Envia email com detalhes do trial
- `sendTrialExpiringEmail()`: Notifica expiração iminente

### 3. Endpoints de API

#### `POST /api/email`
Envia emails usando Resend
- Requer: `RESEND_API_KEY`
- Body: `{ to, subject, html, text }`

#### `POST /api/validate-key`
Valida uma chave de API
- Body: `{ apiKey }`
- Response: `{ valid: boolean, error?: string, trial?: object }`

#### `POST /api/tts`
Gera áudio usando ElevenLabs
- Requer: `ELEVENLABS_API_KEY`
- Body: `{ text, voiceId, apiKey? }`
- Response: Audio MP3

### 4. Componentes React

#### LeadCaptureDialog
- Integrado com `createTrial()`
- Exibe mensagem de sucesso com informações do trial
- Abre Cal.com para agendamento

## Configuração de Variáveis de Ambiente

Adicione as seguintes variáveis ao `.env`:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Resend (para emails)
RESEND_API_KEY=your_resend_api_key

# ElevenLabs (para voice)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

## Fluxo de Criação de Trial

1. **Usuário preenche o formulário de Lead Capture**
   - Full name, business name, email, phone, industry, monthly calls

2. **Clica "Book My Free Demo"**
   - `handleSubmit` é acionado

3. **`createTrial()` é chamada**
   - Cria registro em `website_leads`
   - Cria registro em `trials` com expiração em +7 dias
   - Gera chave de API única
   - Envia email com detalhes

4. **Email é entregue**
   - Contém a chave de API
   - Data de expiração
   - Link para dashboard

5. **Usuário pode usar a API**
   - Usar a chave para chamar `/api/tts`
   - Gerar chamadas com diferentes vozes
   - Testar na dashboard (quando implementada)

## Validação de Chaves de API

```typescript
// Exemplo de validação
const result = await validateApiKey(apiKey);

if (result.valid) {
  // Use o trial
  const trial = result.trial;
  console.log(`Trial expira em: ${trial.expires_at}`);
} else {
  // Erro
  console.error(result.error);
}
```

## Tarefas Pendentes

- [ ] Implementar dashboard de trial
- [ ] Criar job de expiração automática (cron)
- [ ] Implementar email de "trial expirando em 24h"
- [ ] Criar página de upgrade/planos
- [ ] Implementar métricas de uso do trial
- [ ] Adicionar suporte a múltiplos provedores de email
- [ ] Criar admin panel para gerenciar trials
- [ ] Implementar renovação automática após conversão

## Testes

### Criar um trial manualmente
```typescript
import { createTrial } from '@/lib/trial-service';

await createTrial({
  email: 'test@example.com',
  businessName: 'Test Business',
  industry: 'HVAC',
  fullName: 'Test User',
  phone: '+1 (555) 123-4567',
});
```

### Validar uma chave
```typescript
import { validateApiKey } from '@/lib/trial-service';

const result = await validateApiKey('vox_trial_...');
console.log(result);
```

## Segurança

- Chaves de API são geradas com `crypto.randomBytes()`
- Chaves são armazenadas criptografadas no Supabase
- Validação de expiração em cada uso
- Rate limiting recomendado nos endpoints de API

## Suporte

Para questões sobre o sistema de trial, contact suporte@voxmation.com
