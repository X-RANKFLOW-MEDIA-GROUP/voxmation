# 🚀 Fases 3, 4, 5 - Guia Completo de Implementação

## 📊 VISÃO GERAL

Este documento descreve as Fases 3, 4 e 5 do projeto Voxmation - um sistema similar ao GoHighLevel com funcionalidades completas de CRM, Marketing Automation, Phone/Voice Integration e Admin Dashboard.

---

## 🎯 FASE 3: MARKETING AUTOMATION

### Funcionalidades Implementadas

#### 1. **Email Campaigns**
```
GET    /api/campaigns/email           - Listar campanhas
POST   /api/campaigns/email           - Criar campanha
GET    /api/campaigns/email/:id       - Detalhe da campanha
PUT    /api/campaigns/email/:id       - Atualizar campanha
DELETE /api/campaigns/email/:id       - Deletar campanha
POST   /api/campaigns/email/:id/send  - Enviar campanha
GET    /api/campaigns/email/:id/stats - Ver estatísticas (opens, clicks)
```

**Recursos:**
- Rich text editor para templates
- Seletor de destinatários (por tag, segmento)
- Variáveis dinâmicas: {{name}}, {{company}}, {{email}}
- Agendamento de envio
- Tracking de opens e clicks
- A/B testing de subject line

#### 2. **SMS Campaigns (Twilio)**
```
GET    /api/campaigns/sms            - Listar campanhas SMS
POST   /api/campaigns/sms            - Criar campanha SMS
POST   /api/campaigns/sms/:id/send   - Enviar SMS
GET    /api/campaigns/sms/:id/stats  - Estatísticas de entrega
```

**Recursos:**
- Limite de 160/320 caracteres
- Integração com Twilio
- Tracking de delivery
- Custo por mensagem
- Agendamento

#### 3. **Automations/Workflows**
```
GET    /api/automations              - Listar automações
POST   /api/automations              - Criar automation
PUT    /api/automations/:id          - Atualizar automation
DELETE /api/automations/:id          - Deletar automation
POST   /api/automations/:id/test     - Testar trigger
GET    /api/automations/:id/executions - Ver histórico de execução
```

**Triggers Disponíveis:**
- `new_contact` - Quando novo contato é criado
- `stage_change` - Quando oportunidade muda de stage
- `tag_added` - Quando tag é adicionada a contato
- `time_based` - Em horário agendado (cron)
- `webhook` - Trigger via webhook externo

**Actions Disponíveis:**
- `send_email` - Enviar email personalizado
- `send_sms` - Enviar SMS via Twilio
- `create_opportunity` - Criar nova oportunidade
- `update_tag` - Adicionar/remover tag
- `update_contact` - Atualizar dados do contato
- `call_webhook` - Chamar webhook externo

**Exemplo de Workflow:**
```
Trigger: new_contact com source = "phone"
  └─ Action 1: send_email (welcome email)
  └─ Action 2: add_tag (hot_lead)
  └─ Action 3: create_opportunity (Sales Pipeline)
  └─ Action 4: call_webhook (notify Slack)
```

#### 4. **Email Templates**
```
GET    /api/templates                - Listar templates
POST   /api/templates                - Criar template
PUT    /api/templates/:id            - Atualizar template
DELETE /api/templates/:id            - Deletar template
```

**Features:**
- Drag-drop editor
- Variáveis dinâmicas
- Preview em tempo real
- Biblioteca de templates pré-feitos

#### 5. **Webhooks**
```
POST   /api/webhooks                 - Registrar webhook
GET    /api/webhooks                 - Listar webhooks
DELETE /api/webhooks/:id             - Remover webhook
GET    /api/webhooks/:id/logs        - Ver delivery logs
```

**Eventos Disponíveis:**
- `contact.created`
- `contact.updated`
- `opportunity.created`
- `opportunity.won`
- `opportunity.lost`
- `call.completed`
- `email.opened`
- `sms.delivered`

### Banco de Dados - Tabelas Criadas

```sql
email_campaigns
├─ id, account_id, name, subject, from_email
├─ html_body, template_id, recipient_count
├─ sent_count, open_count, click_count
├─ status (draft|scheduled|sent|paused)
└─ scheduled_at, created_by

sms_campaigns
├─ id, account_id, name, message
├─ recipient_count, sent_count, delivery_count
├─ status (draft|scheduled|sent)
├─ scheduled_at, provider (twilio|sendbird)
└─ cost

automations
├─ id, account_id, name, description
├─ trigger_type, trigger_config
├─ actions (jsonb array)
├─ enabled, execution_count
└─ last_executed_at

automation_executions
├─ id, automation_id, contact_id
├─ trigger_data, results
├─ status (success|failed)
└─ error_message

email_templates
├─ id, account_id, name, subject
├─ html_body, variables (array)
├─ category, created_at

webhooks
├─ id, account_id, name, url
├─ events (enum array), is_active
└─ created_at

webhook_logs
├─ id, webhook_id, event
├─ payload (jsonb), response_status
├─ retry_count, created_at

email_logs
├─ campaign_id, contact_id, status
├─ opened_at, clicked_at, bounced_at

sms_logs
├─ campaign_id, contact_id, status
├─ delivered_at, failed_at
```

### Frontend Components - Fases 3

```
src/pages/portal/
├─ Campaigns.tsx
│  └─ Tabs: Email, SMS, Automations
│
├─ campaigns/
│  ├─ EmailCampaignBuilder.tsx
│  ├─ SMSCampaignBuilder.tsx
│  ├─ AutomationBuilder.tsx
│  ├─ WorkflowCanvas.tsx (drag-drop)
│  ├─ TriggerSelector.tsx
│  └─ ActionSelector.tsx
│
└─ analytics/
   └─ CampaignAnalytics.tsx
```

---

## ☎️ FASE 4: PHONE & VOICE INTEGRATION

### Funcionalidades Implementadas

#### 1. **Twilio Phone Calls**

**Endpoints:**
```
POST   /api/calls/make               - Fazer ligação
GET    /api/calls                    - Listar chamadas
GET    /api/calls/:id                - Detalhe da chamada
GET    /api/calls/:id/status         - Status em tempo real
PUT    /api/calls/:id/hold           - Colocar em hold
POST   /api/calls/:id/transfer       - Transferir para outro número
POST   /api/webhooks/twilio          - Webhook de eventos Twilio
```

**Webhook Events Twilio:**
- `call.initiated` - Chamada iniciada
- `call.ringing` - Tocando
- `call.answered` - Respondida
- `call.completed` - Finalizada
- `recording.ready` - Gravação pronta

#### 2. **Call Recordings & Transcriptions**

**Endpoints:**
```
GET    /api/calls/:id/recording      - Download gravação
GET    /api/calls/:id/transcript     - Ver transcrição
GET    /api/calls/:id/sentiment      - Análise de sentimento
POST   /api/calls/:id/transcript/generate - Gerar transcrição
```

**Features:**
- Gravação automática via Twilio
- Transcrição via Twilio STT ou AssemblyAI
- Análise de sentimento (positivo/neutro/negativo)
- Download em MP3/WAV
- Armazenamento seguro

#### 3. **ElevenLabs Voice Integration**

**Endpoints:**
```
POST   /api/voice/tts                - Text to Speech
POST   /api/voice/ivr                - Criar menu IVR
GET    /api/voice/voices             - Listar vozes disponíveis
```

**Vozes Disponíveis:**
- Português (Brasil)
- Português (Portugal)
- English (US/UK)
- Spanish
- French
- German
- Italian

#### 4. **IVR Menu Builder**

**Endpoints:**
```
GET    /api/ivr                      - Listar menus
POST   /api/ivr                      - Criar menu IVR
PUT    /api/ivr/:id                  - Atualizar menu
POST   /api/ivr/:id/activate         - Ativar menu
```

**Nodes Disponíveis:**
- **Say Node** - Fala usando ElevenLabs
- **Gather Node** - Coleta dígitos do usuário
- **Play Node** - Reproduz arquivo de áudio
- **Redirect Node** - Redireciona para outro menu/ramal
- **Hangup Node** - Encerra chamada
- **Record Node** - Grava voz do usuário

**Exemplo de IVR:**
```
┌─ Start
│  └─ Say: "Bem-vindo à empresa"
│     └─ Gather: "Pressione 1 para vendas, 2 para suporte, 3 para sair"
│        ├─ Press 1 → Redirect to Sales Queue
│        ├─ Press 2 → Redirect to Support Queue
│        └─ Press 3 → Hangup
└─ End
```

### Banco de Dados - Tabelas Criadas

```sql
calls
├─ id, account_id, contact_id
├─ call_sid (Twilio), direction (inbound|outbound)
├─ caller_phone, recipient_phone
├─ status (initiated|ringing|answered|completed|failed)
├─ duration_seconds, call_started_at, call_ended_at
├─ recording_url, transcript_status
├─ created_by, created_at

call_recordings
├─ id, account_id, call_id
├─ storage_url, duration_seconds
├─ format (wav|mp3), transcription_status
├─ transcript (text)
├─ sentiment_analysis (jsonb)
└─ created_at

ivr_menus
├─ id, account_id, name, description
├─ nodes (jsonb) - estrutura do menu
├─ is_active, created_by
└─ created_at

voice_prompts
├─ id, account_id, text
├─ voice_id (ElevenLabs), language
├─ audio_url, duration_seconds
└─ created_at
```

### Frontend Components - Fase 4

```
src/pages/portal/
├─ Calls.tsx
│  ├─ CallHistory.tsx (tabela com gravações)
│  ├─ CallDetail.tsx (modal com detalhe)
│  └─ Dialer.tsx (discador web)
│
├─ voice/
│  ├─ VoiceSettings.tsx
│  ├─ IVRBuilder.tsx (drag-drop builder)
│  ├─ NodeLibrary.tsx
│  └─ PreviewIVR.tsx
│
└─ analytics/
   └─ CallAnalytics.tsx
```

---

## 👨‍💼 FASE 5: ADMIN DASHBOARD

### Funcionalidades Implementadas

#### 1. **Account Management**

**Endpoints:**
```
GET    /api/admin/accounts           - Listar todas as contas
GET    /api/admin/accounts/:id       - Detalhe da conta
PATCH  /api/admin/accounts/:id       - Atualizar conta (plan, features, limits)
DELETE /api/admin/accounts/:id       - Deletar conta (soft delete)
POST   /api/admin/accounts/:id/suspend - Suspender conta
POST   /api/admin/accounts/:id/activate - Reativar conta
```

**Informações por Conta:**
- Nome, plan, status
- Data de criação/cancelamento
- Revenue mensal/anual
- Número de users
- Limites (contacts, calls, sms)
- Branding customizado
- API keys

#### 2. **Team Management**

**Endpoints:**
```
GET    /api/admin/accounts/:id/members - Listar membros
POST   /api/admin/accounts/:id/members - Adicionar membro
PUT    /api/admin/accounts/:id/members/:userId - Atualizar role
DELETE /api/admin/accounts/:id/members/:userId - Remover membro

GET    /api/admin/roles              - Listar roles
POST   /api/admin/roles              - Criar role customizado
PUT    /api/admin/roles/:id          - Atualizar role
DELETE /api/admin/roles/:id          - Deletar role
```

**Roles Disponíveis:**
- `owner` - Acesso total à conta
- `admin` - Gerenciar tudo exceto billing
- `manager` - Gerenciar contatos e oportunidades
- `agent` - Usar CRM e fazer chamadas
- `viewer` - Apenas visualizar dados

#### 3. **Billing Management**

**Endpoints:**
```
GET    /api/admin/subscriptions      - Listar subscriptions
PATCH  /api/admin/subscriptions/:id  - Mudar plano
POST   /api/admin/subscriptions/:id/cancel - Cancelar subscription
GET    /api/admin/invoices           - Listar faturas
POST   /api/admin/invoices/:id/resend - Reenviar fatura
GET    /api/admin/revenue            - Relatório de receita
GET    /api/admin/churn              - Análise de churn
```

**Informações de Billing:**
- Plano atual
- MRR (Monthly Recurring Revenue)
- Churn rate
- LTV (Lifetime Value)
- Payment status
- Próxima cobrança

#### 4. **Analytics Dashboard**

**Métricas Globais:**
- Total de contas (ativas/canceladas)
- MRR total
- Active users
- Calls this month
- SMS sent
- Emails sent
- Top features used

**Charts:**
- Revenue trend (últimos 12 meses)
- Growth rate por segmento
- Churn rate
- Feature adoption
- Support tickets

#### 5. **Audit Logs**

**Endpoints:**
```
GET    /api/admin/audit-logs         - Ver audit logs
GET    /api/admin/audit-logs/:userId - Por usuário
GET    /api/admin/audit-logs/:resourceId - Por recurso
```

**Eventos Auditados:**
- Account created/updated/deleted
- User added/removed
- Plan changed
- Feature enabled/disabled
- Payment received/failed
- API key created/revoked

### Banco de Dados - Tabelas Criadas

```sql
team_roles
├─ id, account_id, name
├─ permissions (array)
├─ is_custom, created_at

team_members
├─ id, account_id, user_id
├─ role_id, assigned_leads (array)
├─ assigned_campaigns (array), created_at

agent_performance
├─ id, account_id, user_id, date
├─ calls_handled, call_duration_avg
├─ conversion_rate, customer_satisfaction
├─ interactions_count

audit_logs
├─ id, account_id, user_id
├─ action (created|updated|deleted)
├─ resource_type, resource_id
├─ changes (before/after), timestamp
```

### Frontend Components - Fase 5

```
src/pages/portal/admin/
├─ Dashboard.tsx
│  ├─ KPIs (accounts, MRR, churn)
│  ├─ Charts (revenue, growth)
│  └─ Recent activity
│
├─ Accounts.tsx
│  ├─ Tabela de contas
│  ├─ AccountDetail.tsx (modal)
│  └─ AccountEditor.tsx
│
├─ Billing.tsx
│  ├─ Subscriptions management
│  ├─ Invoice management
│  └─ Revenue analytics
│
├─ Team.tsx
│  ├─ Members table
│  ├─ Role manager
│  ├─ Permissions matrix
│  └─ Custom role builder
│
├─ Analytics.tsx
│  ├─ Custom reports
│  ├─ Export data
│  └─ Scheduled reports
│
└─ AuditLogs.tsx
   ├─ Filter por user/resource
   ├─ Timeline view
   └─ Export logs
```

---

## 🔐 SEGURANÇA & ISOLAMENTO

### Row Level Security (RLS)

Todas as tabelas de usuários têm RLS enforced:

```sql
-- Exemplo: Contatos
CREATE POLICY "contacts_isolate_by_account"
ON contacts FOR ALL
USING (account_id IN (
  SELECT account_id FROM account_members
  WHERE user_id = auth.uid()
))
```

### Autenticação

- JWT tokens com custom claims
- Session storage no localStorage
- Token refresh automático
- Logout limpa dados locais

### Autorização

- Role-based (owner/admin/manager/agent/viewer)
- Permission-based (granular)
- Admin-only endpoints com `requireRole('owner', 'admin')`

---

## 📦 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

```bash
# Supabase
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Twilio
TWILIO_ACCOUNT_SID=AC000000000000000000000000000
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567

# ElevenLabs
ELEVENLABS_API_KEY=sk_xxxxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-password

# Node
NODE_ENV=production
PORT=3001
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Antes de Deploy

- [ ] Todos os testes passando
- [ ] Variáveis de ambiente configuradas
- [ ] Database migrations executadas
- [ ] Stripe webhooks configurados
- [ ] Twilio webhooks apontando para servidor
- [ ] SSL/TLS habilitado
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo
- [ ] Backups do database configurados

### Após Deploy

- [ ] Health check: GET /health
- [ ] Login funciona
- [ ] Stripe checkout funciona
- [ ] Twilio calls funcionam
- [ ] Emails sendo enviados
- [ ] Logs sendo gerados

---

## 📞 SUPORTE

Para questões sobre implementação:
1. Ver documentação de cada fase
2. Verificar exemplos em `server/examples/`
3. Checar logs no console
4. Abrir issue no repositório

---

**Última atualização:** 2026-06-25  
**Status:** ✅ Pronto para Produção
