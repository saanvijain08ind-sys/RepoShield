/**
 * Shared Express Application Factory
 * Used by both local dev/container server (`server.ts`) and Vercel serverless deployment (`api/index.ts`).
 */

import express from 'express';
import { apiRouter } from './routes.ts';

export function createExpressApp(): express.Express {
  const app = express();

  // JSON Body Parser
  app.use(express.json());

  // Mount API Router at both `/api` and `/`
  // This guarantees compatibility with local dev (/api/...) and Vercel rewrites (whether prefix is preserved or stripped)
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  // Health check endpoints
  const healthHandler = (req: express.Request, res: express.Response) => {
    res.json({
      status: 'ok',
      service: 'open-source-security-transition-monitor',
      time: new Date().toISOString(),
      platform: process.env.VERCEL ? 'vercel-serverless' : 'node-server',
    });
  };
  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler);

  // In-app test execution endpoint to run unit & pipeline tests dynamically
  const testHandler = async (req: express.Request, res: express.Response) => {
    try {
      const { runSuite } = await import('../tests/testRunner.ts');
      const results = await runSuite();
      res.json({ success: true, results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
  app.get('/api/test/run', testHandler);
  app.get('/test/run', testHandler);

  return app;
}
