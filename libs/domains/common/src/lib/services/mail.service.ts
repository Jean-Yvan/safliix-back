// mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465, // true si port 465 (TLS)
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  /**
   * Envoie un mail de vérification
   * @param to Email du destinataire
   * @param token Token de vérification
   */
  async sendVerificationMail(to: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Mon App" <${process.env.MAIL_USER}>`, // expéditeur
      to,
      subject: 'Vérification de votre email',
      html: `
        <p>Bonjour,</p>
        <p>Merci de vous être inscrit ! Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <a href="${verificationUrl}">Vérifier mon email</a>
        <p>Si vous n'avez pas créé de compte, ignorez ce mail.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
