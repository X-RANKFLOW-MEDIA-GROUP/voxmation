interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendTrialEmail(
  email: string,
  businessName: string,
  apiKey: string,
  expiresAt: string
): Promise<void> {
  const formattedDate = new Date(expiresAt).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const emailPayload: EmailPayload = {
    to: email,
    subject: '🎉 Seu trial Voxmation está ativo! - 7 dias grátis',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚀 Bem-vindo à Voxmation!</h1>
        </div>

        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Olá <strong>${businessName}</strong>,
          </p>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Seu trial de 7 dias foi ativado com sucesso! Você tem acesso completo ao Voxmation com vozes realistas alimentadas por ElevenLabs.
          </p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
              Sua Chave de API
            </p>
            <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb; font-family: monospace; font-size: 14px; word-break: break-all;">
              <code>${apiKey}</code>
            </div>
          </div>

          <h2 style="color: #1f2937; font-size: 18px; margin-top: 30px;">O que você pode fazer:</h2>
          <ul style="color: #374151; font-size: 16px; line-height: 2;">
            <li>✓ Gerar chamadas AI com vozes realistas</li>
            <li>✓ Testar diferentes indústrias e cenários</li>
            <li>✓ Acessar todas as 5 vozes ElevenLabs</li>
            <li>✓ Até 1.000 chamadas de teste</li>
          </ul>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-weight: 500;">
              ⏱️ Seu trial expira em <strong>${formattedDate}</strong>
            </p>
          </div>

          <p style="color: #374151; font-size: 14px; margin-top: 30px;">
            Para começar, acesse sua dashboard e navegue até "API Keys" para integrar com sua aplicação.
          </p>

          <a href="https://voxmation.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 30px 0;">
            Acessar Dashboard
          </a>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">

          <p style="color: #6b7280; font-size: 14px;">
            Dúvidas? Entre em contato com nossa equipe em <a href="mailto:suporte@voxmation.com" style="color: #667eea; text-decoration: none;">suporte@voxmation.com</a>
          </p>

          <p style="color: #9ca3af; font-size: 12px;">
            © 2026 Voxmation. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `,
    text: `
Bem-vindo à Voxmation!

Seu trial de 7 dias foi ativado com sucesso!

SUA CHAVE DE API:
${apiKey}

O que você pode fazer:
✓ Gerar chamadas AI com vozes realistas
✓ Testar diferentes indústrias e cenários
✓ Acessar todas as 5 vozes ElevenLabs
✓ Até 1.000 chamadas de teste

Seu trial expira em ${formattedDate}

Para começar, acesse sua dashboard e navegue até "API Keys" para integrar com sua aplicação.

Dúvidas? Entre em contato conosco em suporte@voxmation.com

© 2026 Voxmation
    `,
  };

  try {
    // Call your email service (Resend, SendGrid, etc.)
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      throw new Error(`Email service returned ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending trial email:', error);
    // Don't throw - silently fail so signup still completes
  }
}

export async function sendTrialExpiringEmail(
  email: string,
  businessName: string,
  expiresAt: string
): Promise<void> {
  const emailPayload: EmailPayload = {
    to: email,
    subject: '⏰ Seu trial Voxmation expira em 24 horas',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Seu Trial Está Acabando!</h1>
        </div>

        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Olá <strong>${businessName}</strong>,
          </p>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Seu trial de 7 dias com a Voxmation expira em <strong>24 horas</strong> (${expiresAt}).
          </p>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-weight: 500;">
              Aproveite sua última chance para testar a IA mais avançada do mercado!
            </p>
          </div>

          <a href="https://voxmation.com/pricing" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 30px 0;">
            Ver Planos
          </a>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">

          <p style="color: #6b7280; font-size: 14px;">
            Dúvidas? Fale conosco em <a href="mailto:suporte@voxmation.com" style="color: #667eea; text-decoration: none;">suporte@voxmation.com</a>
          </p>
        </div>
      </div>
    `,
    text: `
Seu Trial Está Acabando!

Seu trial de 7 dias com a Voxmation expira em 24 horas (${expiresAt}).

Aproveite sua última chance para testar a IA mais avançada do mercado!

Ver Planos: https://voxmation.com/pricing

Dúvidas? Fale conosco em suporte@voxmation.com
    `,
  };

  try {
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    });
  } catch (error) {
    console.error('Error sending expiring trial email:', error);
  }
}
