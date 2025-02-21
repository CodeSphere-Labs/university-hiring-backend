export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3000,
  jwt: {
    access: process.env.JWT_ACCESS_SECRET,
    refresh: process.env.JWT_REFRESH_SECRET,
    invite: process.env.JWT_INVITE_SECRET,
  },
  db: {
    pass: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    connectUrl: process.env.DATABASE_URL,
  },
  email: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    inviteUrl: process.env.EMAIL_INVITE_URL,
  },
  cookie: {
    secure: process.env.COOKIE_SECURE,
  },
});
