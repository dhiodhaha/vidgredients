import { expo } from '@better-auth/expo';
import { neon } from '@neondatabase/serverless';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';

// Initialize Neon client - will use DATABASE_URL from environment
const getDb = (databaseUrl: string) => {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
};

export const createAuth = (env: { 
  DATABASE_URL: string; 
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_BASE_URL: string;
}) => {
  const db = getDb(env.DATABASE_URL);

  return betterAuth({
    baseURL: env.BETTER_AUTH_BASE_URL,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        ...schema,
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
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
