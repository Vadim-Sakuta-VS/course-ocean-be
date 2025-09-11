import { Injectable, OnModuleInit } from '@nestjs/common';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { ConfigService } from '@nestjs/config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { __IS_PROD__ } from '../config/constants';
import { EmailContentOptions } from './types';
import Handlebars from 'handlebars';

@Injectable()
export class MailerService implements OnModuleInit {
  private static SENDER_EMAIL: string;
  private static GOOGLE_MAILER_CLIENT_ID: string;
  private static GOOGLE_MAILER_CLIENT_SECRET: string;
  private static GOOGLE_MAILER_REFRESH_TOKEN: string;
  private static ETHEREAL_PASSWORD: string;
  private oAuth2Client: OAuth2Client;
  private accessToken: string;
  private expiryDate: number;
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private configService: ConfigService) {
    MailerService.SENDER_EMAIL = __IS_PROD__
      ? configService.getOrThrow<string>('GOOGLE_EMAIL')
      : configService.getOrThrow<string>('ETHEREAL_EMAIL');
    MailerService.GOOGLE_MAILER_CLIENT_ID = configService.getOrThrow<string>(
      'GOOGLE_MAILER_CLIENT_ID',
    );
    MailerService.GOOGLE_MAILER_CLIENT_SECRET =
      configService.getOrThrow<string>('GOOGLE_MAILER_CLIENT_SECRET');
    MailerService.GOOGLE_MAILER_REFRESH_TOKEN =
      configService.getOrThrow<string>('GOOGLE_MAILER_REFRESH_TOKEN');
    MailerService.ETHEREAL_PASSWORD =
      configService.getOrThrow<string>('ETHEREAL_PASSWORD');
  }

  async onModuleInit() {
    await this.initializeEmailService();
  }

  private async initializeEmailService() {
    if (__IS_PROD__) {
      this.oAuth2Client = new google.auth.OAuth2(
        MailerService.GOOGLE_MAILER_CLIENT_ID,
        MailerService.GOOGLE_MAILER_CLIENT_SECRET,
      );
      this.oAuth2Client.setCredentials({
        refresh_token: MailerService.GOOGLE_MAILER_REFRESH_TOKEN,
      });
      await this.refreshAccessToken();
    }
    this.createTransporter();

    console.log('Email service initialized successfully');
  }

  private async refreshAccessToken() {
    try {
      const { credentials } = await this.oAuth2Client.refreshAccessToken();
      this.accessToken = credentials.access_token as string;
      this.expiryDate = credentials.expiry_date as number;

      // Обновляем в памяти, не нужно сохранять каждый раз
      this.oAuth2Client.setCredentials(credentials);

      console.log('Access token refreshed');
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  private createTransporter() {
    const options: SMTPTransport.Options = __IS_PROD__
      ? {
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: MailerService.SENDER_EMAIL,
            clientId: MailerService.GOOGLE_MAILER_CLIENT_ID,
            clientSecret: MailerService.GOOGLE_MAILER_CLIENT_SECRET,
            accessToken: this.accessToken,
            refreshToken: MailerService.GOOGLE_MAILER_REFRESH_TOKEN,
          },
        }
      : {
          service: 'Ethereal',
          auth: {
            user: MailerService.SENDER_EMAIL,
            pass: MailerService.ETHEREAL_PASSWORD,
          },
        };
    this.transporter = nodemailer.createTransport(options);
  }

  private async ensureValidToken() {
    if (Date.now() > this.expiryDate) {
      await this.refreshAccessToken();
      this.createTransporter();
    }
  }

  async sendEmail(to: string, subject: string, content: EmailContentOptions) {
    try {
      if (__IS_PROD__) {
        await this.ensureValidToken();
      }

      const template = Handlebars.compile(content.html);
      const html = content.context ? template(content.context) : content.html;
      const info = await this.transporter.sendMail({
        from: MailerService.SENDER_EMAIL,
        to,
        subject,
        html,
      });

      if (!__IS_PROD__) {
        console.log(`Email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return {
        success: !!info.messageId,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send email');
    }
  }
}
