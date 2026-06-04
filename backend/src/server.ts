import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './shared/prisma';

async function main() {
  // Fail fast if the database is unreachable.
  await prisma.$connect();

  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`\n🦷  Odontotech API rodando em http://localhost:${env.port}`);
    // eslint-disable-next-line no-console
    console.log(`    CORS liberado para: ${env.cors.origin.join(', ')}\n`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
