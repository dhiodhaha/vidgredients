import { Hono } from 'hono';
import { createAuth } from '../lib/auth';

type Bindings = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
};

export const authRoute = new Hono<{ Bindings: Bindings }>();

// Better Auth handler - handles all /auth/* routes
authRoute.all('/*', async (c) => {
  const auth = createAuth({
    DATABASE_URL: c.env.DATABASE_URL,
    BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET,
  });
  return auth.handler(c.req.raw);
});
