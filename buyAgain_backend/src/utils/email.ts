import nodemailer, { Transporter } from 'nodemailer';
import { convert } from 'html-to-text';

interface UserType {
  email: string;
  name: string;
}

interface MailOptions {
  subject: string;
  html: string; // Coming from buyAgain_frontend
}

class Email {
  private to: string;
  private firstName: string;
  private url: string;
  private from: string;

  constructor(user: UserType, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `<${process.env.EMAIL_FROM}>`;
  }

  private newTransport(): Transporter {
    if (process.env.NODE_ENV === 'production') {
      // Production: use SendGrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME!,
          pass: process.env.SENDGRID_PASSWORD!,
        },
      });
    }

    // Development: use Mailtrap or SMTP
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST!,
      port: Number(process.env.EMAIL_PORT!),
      auth: {
        user: process.env.EMAIL_USERNAME!,
        pass: process.env.EMAIL_PASSWORD!,
      },
    });
  }

  /**
   * Sends an email using the provided subject and HTML (from frontend).
   */
  async send({ subject, html }: MailOptions): Promise<void> {
    const text = convert(html);

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  /**
   * e.g.,: Sends a welcome email using frontend template.
   */
  async sendWelcome(html: string): Promise<void> {
    await this.send({ subject: 'Welcome to Our App!', html });
  }

  /**
   * e.g.,: Sends password reset email using frontend template.
   */
  async sendPasswordReset(html: string): Promise<void> {
    await this.send({
      subject: 'Reset your password (valid for 10 minutes)',
      html,
    });
  }
}

export default Email;
