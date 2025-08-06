declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    DATABASE: string;
    DATABASE_PASSWORD: string;
    JWT_SECRET?: string;
    JWT_COOKIE_EXPIRES_IN?: string;
    JWT_EXPIRES_IN?: string;
    NODE_ENV?: string;
    EMAIL_USERNAME?: string;
    EMAIL_PASSWORD?: string;
    EMAIL_HOST?: string;
    EMAIL_PORT?: string;
    EMAIL_FROM?: string;
    SENDGRID_USERNAME?: string;
    SENDGRID_PASSWORD?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
  }
}
