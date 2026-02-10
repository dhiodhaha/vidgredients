import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { analyze } from './routes/analyze';
import { authRoute } from './routes/auth';
import { grocery } from './routes/grocery';
import { health } from './routes/health';
import { mealPlans } from './routes/meal-plans';

export type Bindings = {
  DATABASE_URL: string;
  OPENAI_API_KEY: string;
  SCRAPECREATORS_API_KEY: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_BASE_URL: string;
  UNSPLASH_ACCESS_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Routes
app.route('/health', health);
app.route('/analyze', analyze);
app.route('/api/auth', authRoute);
app.route('/meal-plans', mealPlans);
app.route('/grocery', grocery);

// Default route
app.get('/', (c) => {
  return c.json({
    name: 'Video to Ingredients API',
    version: '1.0.0',
    status: 'healthy',
  });
});

export default app;
