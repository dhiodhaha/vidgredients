import { Hono } from 'hono';
import { createAuth } from '../lib/auth';

type Bindings = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_BASE_URL: string;
};

export const authRoute = new Hono<{ Bindings: Bindings }>();

// Better Auth handler - handles all /auth/* routes
authRoute.all('/*', async (c) => {
  const auth = createAuth({
    DATABASE_URL: c.env.DATABASE_URL,
    BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_BASE_URL: c.env.BETTER_AUTH_BASE_URL,
  });

  // Clone request to ensure headers are mutable (a workaround for Cloudflare Workers immutable headers issue)
  const req = c.req.raw;
  const url = new URL(req.url);
  const newReq = new Request(url.toString(), {
    method: req.method,
    headers: new Headers(req.headers),
    body: req.body,
    // @ts-ignore - duplex is needed for some environments but might be just ignored in others
    duplex: 'half',
  });

  return auth.handler(newReq);
});
