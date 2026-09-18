/**
 * Vercel Serverless Function Entry Point
 * Mounts the Open Source Security Transition Monitor Express API.
 */

import { createExpressApp } from '../server/app.ts';

const app = createExpressApp();

export default app;
