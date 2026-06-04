import { z } from 'zod';

const base = z.object({
  name: z.string().min(1, 'Nome obrigatório.'),
  // coveragePercent (canonical) / coverage (frontend)
  coveragePercent: z.coerce.number().int().min(0).max(100).optional(),
  coverage: z.coerce.number().int().min(0).max(100).optional(),
  status: z.enum(['ativo', 'inativo']).optional().default('ativo'),
  // gracePeriod (canonical) / carencia (frontend)
  gracePeriod: z.string().optional().nullable(),
  carencia: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  serviceCount: z.coerce.number().int().min(0).optional(),
  services: z.coerce.number().int().min(0).optional(), // frontend alias (count)
});

function normalize(d: z.infer<typeof base>) {
  return {
    name: d.name,
    coveragePercent: d.coveragePercent ?? d.coverage ?? 0,
    status: d.status ?? 'ativo',
    gracePeriod: d.gracePeriod ?? d.carencia ?? null,
    color: d.color ?? 'blue',
    serviceCount: d.serviceCount ?? d.services ?? 0,
  };
}

export const createPlanSchema = base.transform(normalize);

export const updatePlanSchema = base.partial().transform((d) => {
  const out = normalize(d as z.infer<typeof base>);
  const cleaned: Record<string, unknown> = {};
  if (d.name !== undefined) cleaned.name = out.name;
  if (d.coveragePercent !== undefined || d.coverage !== undefined) cleaned.coveragePercent = out.coveragePercent;
  if (d.status !== undefined) cleaned.status = out.status;
  if (d.gracePeriod !== undefined || d.carencia !== undefined) cleaned.gracePeriod = out.gracePeriod;
  if (d.color !== undefined) cleaned.color = out.color;
  if (d.serviceCount !== undefined || d.services !== undefined) cleaned.serviceCount = out.serviceCount;
  return cleaned;
});

export const listPlansQuerySchema = z.object({
  status: z.enum(['ativo', 'inativo', 'all']).optional(),
});
