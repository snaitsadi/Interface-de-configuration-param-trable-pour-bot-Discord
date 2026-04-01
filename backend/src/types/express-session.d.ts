import 'express-session';

declare module 'express-session' {
  interface SessionData {
    discordUser?: {
      id: string;
      username: string;
      avatar: string;
      discriminator: string;
    };
    accessToken?: string;
  }
}