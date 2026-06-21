import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { env } from './config/env';
import { ok } from './shared/response';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { authenticate } from './middlewares/auth.middleware';
import { asyncHandler } from './shared/async-handler';

import authRouter from './modules/auth/router';
import patientsRouter from './modules/patients/router';
import appointmentsRouter from './modules/appointments/router';
import servicesRouter from './modules/services/router';
import plansRouter from './modules/plans/router';
import examsRouter, { patientExamsRouter } from './modules/exams/router';
import dentalRecordRouter from './modules/dental-records/router';
import configRouter from './modules/config/router';
import { configController } from './modules/config/controller';

export function createApp() {
  const app = express();

  // --- Core middleware -------------------------------------------------
  // With credentials, the cors package can't use a literal '*'; `true` instead
  // reflects the request origin (correct for same-origin and dev). A concrete
  // list locks it down to those origins.
  const corsOrigin = env.cors.origin.includes('*') ? true : env.cors.origin;
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Exam files live in Supabase Storage now (served via signed URLs), so there
  // is no local /uploads route to expose here.

  // Serve the static frontend (mock SPA) so the whole app runs same-origin
  // from a single process: http://localhost:PORT/Odontotech.html
  // __dirname differs across environments (backend/src under ts-node,
  // backend/dist/src compiled, /var/task/... on Vercel), so probe candidates
  // and use the first that exists. FRONTEND_DIR overrides everything.
  const frontendDir = resolveFrontendDir();
  if (frontendDir) app.use(express.static(frontendDir));

  // --- Health / root ---------------------------------------------------
  app.get('/health', (_req, res) => ok(res, { status: 'ok', uptime: process.uptime() }));
  app.get('/api', (_req, res) => ok(res, { name: 'Odontotech API', version: '1.0.0', status: 'online' }));
  app.get('/', (_req, res) => res.redirect('/Odontotech.html'));
  // The browser auto-requests this; reply 204 instead of a noisy 404 in the console.
  app.get('/favicon.ico', (_req, res) => res.status(204).end());

  // --- Routes ----------------------------------------------------------
  app.use('/auth', authRouter);
  app.use('/patients', patientsRouter);
  // Nested patient sub-resources (registered separately so :id is available)
  app.use('/patients/:id/exams', patientExamsRouter);
  app.use('/patients/:id/dental-record', dentalRecordRouter);

  app.use('/appointments', appointmentsRouter);
  app.use('/services', servicesRouter);
  app.use('/plans', plansRouter);
  app.use('/exams', examsRouter);
  app.use('/config', configRouter);

  // Convenience alias for the agenda/exam dropdowns.
  app.get('/dentists', authenticate, asyncHandler(configController.listDentists));

  // --- Errors ----------------------------------------------------------
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

/** Locate the static frontend folder across dev/compiled/serverless layouts. */
function resolveFrontendDir(): string | null {
  const candidates = [
    process.env.FRONTEND_DIR,
    path.resolve(__dirname, '..', '..', 'frontend'), // ts-node: backend/src -> repo/frontend
    path.resolve(__dirname, '..', '..', '..', 'frontend'), // compiled: backend/dist/src -> repo/frontend
    path.resolve(process.cwd(), 'frontend'),
    path.resolve(process.cwd(), '..', 'frontend'),
  ].filter(Boolean) as string[];

  return candidates.find((dir) => fs.existsSync(path.join(dir, 'Odontotech.html'))) ?? null;
}
