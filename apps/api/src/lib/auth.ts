import { expo } from '@better-auth/expo';
import { neon } from '@neondatabase/serverless';
import { betterAuth } from 'better-auth';
import { drizzle } from 'drizzle-orm/neon-http';

// Initialize Neon client - will use DATABASE_URL from environment
const getDb = (databaseUrl: string) => {
  const sql = neon(databaseUrl);
  return drizzle(sql);
};

export const createAuth = (env: { DATABASE_URL: string; BETTER_AUTH_SECRET: string }) => {
  return betterAuth({
    database: getDb(env.DATABASE_URL),
    secret: env.BETTER_AUTH_SECRET,
    plugins: [expo()],
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: [
      'video-to-ingredients://',
      // Development mode - Expo's exp:// scheme with local IP ranges
      ...(process.env.NODE_ENV === 'development'
        ? ['exp://', 'exp://**', 'exp://192.168.*.*:*/**', 'exp://localhost:*/**']
        : []),
    ],
    user: {
      additionalFields: {
        isPremium: {
          type: 'boolean',
          required: false,
          defaultValue: false,
        },
      },
    },
  });
};

export type Auth = ReturnType<typeof createAuth>;
