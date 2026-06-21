/* Vercel serverless entry point.

   server.ts calls app.listen() for local dev and long-running hosts. On Vercel
   each request invokes an exported handler instead, so here we just build the
   Express app (which IS a (req, res) handler) and export it. Prisma connects
   lazily on the first query, so there is no app.listen / $connect here. */
import { createApp } from './app';

const app = createApp();

export default app;
