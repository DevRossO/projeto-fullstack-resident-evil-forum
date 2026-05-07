import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
  port: parseInt(process.env.MAILTRAP_PORT || "587"),
  auth: {
    user: process.env.MAILTRAP_USER || "9fa75ade239c68",
    pass: process.env.MAILTRAP_PASSWORD || "bf8ec3cb469eff",
  },
  secure: process.env.MAILTRAP_SECURE === "true",
});

export interface CommentEmailData {
  usuarioEmail: string;
  usuarioNome: string;
  jogoTitulo: string;
  comentarioTexto: string;
  data: Date;
}

export async function enviarEmailComentario(data: CommentEmailData): Promise<void> {
  const recipientEmail = process.env.RECIPIENT_EMAIL || "felipe_rosso123@hotmail.com";

  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(data.data);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #333;
          margin: 0;
          font-size: 24px;
        }
        .header p {
          color: #666;
          margin: 5px 0 0 0;
          font-size: 14px;
        }
        .user-info {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .user-info p {
          margin: 5px 0;
          color: #333;
          font-size: 14px;
        }
        .user-name {
          font-weight: 600;
          color: #333;
        }
        .user-email {
          color: #666;
          font-size: 13px;
        }
        .divider {
          height: 1px;
          background-color: #ddd;
          margin: 15px 0;
        }
        .game-title {
          font-size: 18px;
          font-weight: 700;
          color: #000;
          margin: 20px 0 15px 0;
          padding: 15px;
          background-color: #f0f0f0;
          border-left: 4px solid #d32f2f;
          border-radius: 3px;
        }
        .comment-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 15px 0;
          font-size: 13px;
          color: #666;
        }
        .comment-date {
          background-color: #fafafa;
          padding: 5px 10px;
          border-radius: 3px;
        }
        .comment-text {
          background-color: #fffbf0;
          padding: 15px;
          border-left: 3px solid #ff9800;
          border-radius: 3px;
          line-height: 1.6;
          color: #333;
          margin: 15px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Relatório de Comentários</h1>
          <p>Novo comentário recebido no fórum</p>
        </div>

        <div class="user-info">
          <p class="user-name">${data.usuarioNome}</p>
          <p class="user-email">${data.usuarioEmail}</p>
        </div>

        <div class="divider"></div>

        <div class="game-title">${data.jogoTitulo}</div>

        <div class="comment-meta">
          <span>📅 Data e Hora:</span>
          <span class="comment-date">${dataFormatada}</span>
        </div>

        <div class="comment-text">
          ${data.comentarioTexto}
        </div>

        <div class="footer">
          <p>Este é um email automático. Não responda diretamente neste email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.MAILTRAP_FROM || "noreply@forumresidentevil.com",
      to: recipientEmail,
      subject: "Relatório de Comentários",
      html: htmlContent,
    });

    console.log(`Email enviado com sucesso para ${recipientEmail}`);
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw new Error("Erro ao enviar email de notificação");
  }
}
