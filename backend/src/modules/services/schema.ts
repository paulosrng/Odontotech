import { z } from 'zod';

const base = z.object({
  name: z.string().min(1, 'Nome obrigatório.'),
  // description (canonical) / desc (frontend)
  description: z.string().optional().nullable(),
  desc: z.string().optional().nullable(),
  price: z.coerce.number().min(0).default(0),
  // duration (canonical) / dur (frontend)
  duration: z.coerce.number().int().min(0).optional(),
  dur: z.coerce.number().int().min(0).optional(),
  // category (canonical) / cat (frontend)
  category: z.string().optional(),
  cat: z.string().optional(),
});

function normalize(d: z.infer<typeof base>) {
  return {
    name: d.name,
    description: d.description ?? d.desc ?? null,
    price: d.price ?? 0,
    duration: d.duration ?? d.dur ?? 30,
    category: d.category ?? d.cat ?? 'Clínica Geral',
  };
}

export const createServiceSchema = base
  .refine((d) => (d.category ?? d.cat), { message: 'Categoria obrigatória.', path: ['category'] })
  .transform(normalize);

export const updateServiceSchema = base.partial().transform((d) => {
  const out = normalize(d as z.infer<typeof base>);
  const cleaned: Record<string, unknown> = {};
  // only keep fields that were actually provided
  if (d.name !== undefined) cleaned.name = out.name;
  if (d.description !== undefined || d.desc !== undefined) cleaned.description = out.description;
  if (d.price !== undefined) cleaned.price = out.price;
  if (d.duration !== undefined || d.dur !== undefined) cleaned.duration = out.duration;
  if (d.category !== undefined || d.cat !== undefined) cleaned.category = out.category;
  return cleaned;
});

export const listServicesQuerySchema = z.object({
  search: z.string().optional(),
  q: z.string().optional(),
  category: z.string().optional(),
  cat: z.string().optional(),
});
