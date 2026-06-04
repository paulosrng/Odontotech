import express from 'express';
import cors from 'cors';
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
  app.use(
    cors({
      origin: env.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files statically (e.g. /uploads/xyz.jpg)
  app.use(`/${env.uploads.dir}`, express.static(env.uploads.absoluteDir));

  // Serve the static frontend (mock SPA) so the whole app runs same-origin
  // from a single process: http://localhost:PORT/Odontotech.html
  // Resolved from __dirname (not process.cwd()) so it works regardless of the
  // directory the server is launched from. __dirname is backend/src (ts-node)
  // or backend/dist (compiled); both are one level below backend/.
  const frontendDir = path.resolve(__dirname, '..', '..', 'frontend');
  app.use(express.static(frontendDir));

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
