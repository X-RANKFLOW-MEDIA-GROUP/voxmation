# Email Campaigns Backend Setup Guide

## Overview

O backend de campanhas de email foi implementado com:
- **Endpoints REST** para gerenciar campanhas
- **Fila de email** para processamento em lote
- **Personalização dinâmica** de emails com variáveis
- **Estatísticas em tempo real** de envios
- **Middleware de autenticação** e autorização

## Arquivos Criados

### Routes
- `/server/routes/campaigns.ts` - Todos os endpoints de campanhas

### Services
- `/server/services/emailQueueService.ts` - Gerenciamento da fila de email

### Types
- `/server/types/campaign.ts` - Interfaces TypeScript

### Tests
- `/server/tests/campaigns.test.ts` - Testes unitários

### Examples
- `/server/examples/campaign-examples.ts` - Exemplos de uso

### Database
- `/server/migrations/create_campaigns_table.sql` - Schema do banco de dados

### Documentation
- `/server/routes/CAMPAIGNS_API.md` - Documentação completa da API

## Endpoints Implementados

### 1. Criar Campanha
```bash
POST /api/campaigns/email
```
Cria uma nova campanha em estado de rascunho.

**Exemplo:**
```json
{
  "name": "Q1 Launch",
  "subject": "Introducing {{productName}}",
  "htmlBody": "<html>...</html>",
  "fromEmail": "campaigns@voxmation.com",
  "recipients": [
    {
      "email": "user@example.com",
      "name": "User",
      "variables": {
        "productName": "ProductX"
      }
    }
  ]
}
```

### 2. Listar Campanhas
```bash
GET /api/campaigns/email?status=draft&limit=50&offset=0
```
Lista todas as campanhas com filtro opcional por status.

### 3. Obter Campanha Específica
```bash
GET /api/campaigns/email/:id
```
Retorna detalhes completos de uma campanha.

### 4. Atualizar Campanha
```bash
PUT /api/campaigns/email/:id
```
Atualiza uma campanha em estado de rascunho.

### 5. Enviar Campanha
```bash
POST /api/campaigns/email/:id/send
Body: { "immediate": true }
```
Enfileira os emails para envio processamento.

### 6. Obter Estatísticas
```bash
GET /api/campaigns/email/:id/stats
```
Retorna estatísticas detalhadas de envio.

### 7. Pausar Campanha
```bash
POST /api/campaigns/email/:id/pause
```
Pausa uma campanha em envio.

### 8. Deletar Campanha
```bash
DELETE /api/campaigns/email/:id
```
Deleta campanhas em estado de rascunho ou pausa.

### 9. Status da Fila
```bash
GET /api/campaigns/queue/status
```
Retorna estatísticas da fila de email (apenas admin).

## Fluxo de Campanhas

```
Draft (rascunho)
  ├─ Pode ser editado
  ├─ Pode ser deletado
  └─ Pode ser enviado
     │
     ├─ Sending (enviando)
     │  ├─ Pode ser pausado
     │  └─ Emails na fila
     │
     ├─ Scheduled (agendado)
     │  └─ Aguardando envio
     │
     └─ Sent (enviado)
        └─ Finalizado

Paused (pausado)
  ├─ Pode ser retomado
  ├─ Pode ser deletado
  └─ Emails pendentes permanecem na fila
```

## Sistema de Fila de Email

### Estrutura
- Cada email é enfileirado como um item separado
- Status por item: `pending`, `sent`, `failed`
- Suporta até 3 tentativas por email
- Inclui personalização por destinatário

### Processamento
```typescript
// 1. Email é enfileirado com status "pending"
// 2. Sistema tenta enviar
// 3. Se sucesso: marca como "sent"
// 4. Se falha: marca como "failed" e incrementa tentativas
// 5. Após 3 tentativas, encerra
```

### Variáveis de Personalização

```html
Subject: Hello {{name}}, check out {{productName}}
Body: <p>Dear {{name}},</p>
      <p>Your code: {{code}}</p>
```

Cada destinatário pode ter variáveis diferentes:
```json
{
  "email": "user@example.com",
  "name": "John",
  "variables": {
    "name": "John",
    "productName": "ProductX",
    "code": "PROMO123"
  }
}
```

## Integração com Sistema de Email

O serviço usa a função `sendEmail` existente:
```typescript
await sendEmail({
  to: "recipient@example.com",
  subject: "Personalized subject",
  html: "Personalized HTML",
  text: "Personalized text"
});
```

Suporta:
- SendGrid
- Gmail
- SMTP genérico

Configurado via variáveis de ambiente.

## Middleware de Autenticação

Todos os endpoints usam `tenantMiddleware`:
- Extrai `accountId` do contexto do tenant
- Valida que campanha pertence à conta

Alguns endpoints requerem roles específicas:
- `admin`: Acesso total
- `marketing`: Criar e enviar campanhas

## Estatísticas em Tempo Real

```typescript
{
  "stats": {
    "total": 100,
    "sent": 45,
    "failed": 5,
    "pending": 50
  }
}
```

Atualizado conforme emails são processados.

## Exemplo de Uso Completo

### 1. Criar Campanha
```javascript
const response = await fetch('/api/campaigns/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Campaign',
    subject: 'Hello {{name}}',
    htmlBody: '<p>Hello {{name}}</p>',
    fromEmail: 'sender@voxmation.com',
    recipients: [
      {
        email: 'user@example.com',
        name: 'John',
        variables: { name: 'John' }
      }
    ]
  })
});

const { campaignId } = await response.json();
```

### 2. Enviar Campanha
```javascript
await fetch(`/api/campaigns/email/${campaignId}/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ immediate: true })
});
```

### 3. Monitorar Progresso
```javascript
const stats = await fetch(`/api/campaigns/email/${campaignId}/stats`);
const data = await stats.json();
console.log(`Enviados: ${data.stats.stats.sent}`);
console.log(`Pendentes: ${data.stats.stats.pending}`);
console.log(`Falhados: ${data.stats.stats.failed}`);
```

## Armazenamento Persistente

### Em Memória (Atual)
- Campanhas armazenadas em `Map`
- Fila em `Map`
- Ideal para desenvolvimento e testes

### Com Banco de Dados (Produção)
Execute a migração:
```sql
-- Fazer upload de server/migrations/create_campaigns_table.sql
-- para o Supabase
```

Tabelas criadas:
- `email_campaigns` - Dados das campanhas
- `email_queue` - Itens da fila
- `campaign_audit_log` - Histórico de alterações

## Testando Localmente

### 1. Iniciar Servidor
```bash
npm run dev
```

### 2. Criar Campanha (cURL)
```bash
curl -X POST http://localhost:3001/api/campaigns/email \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign",
    "subject": "Test",
    "htmlBody": "<p>Test</p>",
    "fromEmail": "test@voxmation.com",
    "recipients": [
      {
        "email": "your-email@example.com",
        "name": "Test User",
        "variables": {}
      }
    ]
  }'
```

### 3. Obter Resposta
Anote o `campaignId` retornado.

### 4. Enviar Campanha
```bash
curl -X POST http://localhost:3001/api/campaigns/email/{campaignId}/send \
  -H "Content-Type: application/json" \
  -d '{"immediate": true}'
```

### 5. Verificar Estatísticas
```bash
curl http://localhost:3001/api/campaigns/email/{campaignId}/stats
```

## Segurança

### Controle de Acesso
- Verificação de `accountId` em todos os endpoints
- Validação de roles para operações sensíveis
- Impossível acessar campanhas de outras contas

### Validação
- Validação de emails
- Sanitização de entrada
- Limite de tamanho (50MB para upload)

### Melhores Práticas
- Nunca armazenar senhas em campanhas
- Incluir link de unsubscribe (requisito legal)
- Usar HTTPS em produção

## Performance

### Limitações Atuais
- Fila em memória: ideal até ~10k emails
- Para escala maior, usar Redis ou queue service

### Otimizações
```typescript
// Processamento em batch
async function processBatch(items: EmailQueueItem[]) {
  // Processar múltiplos emails em paralelo
  // Com controle de rate limiting
}
```

## Monitoramento

### Métricas Importantes
- Taxa de entrega (sent/total)
- Taxa de falha (failed/total)
- Tempo médio de envio
- Distribuição de status da fila

### Alertas Recomendados
- Taxa de falha > 5%
- Fila com > 1000 pendentes
- Tempo de processamento > 5 min

## Roadmap Futuro

- [ ] Template builder com WYSIWYG
- [ ] A/B testing de subject/content
- [ ] Análise de engagement (opens, clicks)
- [ ] Gerenciamento de listas de contatos
- [ ] Webhooks de eventos
- [ ] Suporte a anexos
- [ ] Agendamento avançado com cron
- [ ] Bounce handling
- [ ] Score de spam
- [ ] Integração com CRM

## Troubleshooting

### Emails não estão sendo enviados
1. Verificar variáveis de ambiente do email
2. Verificar status da campanha
3. Verificar logs da fila

### Taxa de falha alta
1. Validar formato dos emails
2. Verificar configuração do SMTP
3. Aumentar tentativas ou delay

### Fila crescendo muito
1. Aumentar workers de processamento
2. Verificar se há erros no SMTP
3. Escalar para Redis/DB

## Suporte

Para problemas ou dúvidas:
1. Verificar `/server/routes/CAMPAIGNS_API.md` (documentação completa)
2. Verificar `/server/examples/campaign-examples.ts` (exemplos)
3. Executar `/server/tests/campaigns.test.ts` (testes)
