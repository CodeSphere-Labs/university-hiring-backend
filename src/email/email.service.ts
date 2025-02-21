import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'yandex',
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.pass'),
      },
    });
  }

  async sendInvitationMail(to: string, inviteToken: string) {
    const inviteUrl = `${this.configService.get<string>('email.inviteUrl')}/invite/${inviteToken}`;
    const subject = 'Приглашение в Universities Hiring';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #2D89EF;">Добро пожаловать в Universities Hiring!</h2>
      <p>Вы получили это письмо, потому что вас пригласили зарегистрироваться на платформе Universities Hiring.</p>
      <p>Для завершения регистрации, нажмите на кнопку ниже:</p>
      <a href="${inviteUrl}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #2D89EF; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px;">
        Присоединиться
      </a>
      <p style="font-size: 12px; color: #666;">Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
      <p style="font-size: 14px; word-wrap: break-word;">${inviteUrl}</p>
      <hr style="border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #888;">Если вы не запрашивали это приглашение, просто проигнорируйте письмо.</p>
    </div>
  `;

    this.sendMail(to, subject, '', html);
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    await this.transporter.sendMail({
      from: this.configService.get<string>('email.user'),
      to,
      subject,
      text,
      html,
    });
  }
}
