import { z } from 'zod';
import { parseYmdLocal } from '../../shared/dates';

// Accepts a string array, or a comma-separated string, normalizes to string[].
const arrayLike = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (Array.isArray(v)) return v.map((s) => s.trim()).filter(Boolean);
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  });

// Date that accepts "YYYY-MM-DD" or ISO strings.
const dateLike = z.coerce.date();

// Base shape — accepts both canonical names and frontend aliases.
const baseObject = z.object({
  name: z.string().min(1, 'Nome obrigatório.'),
  cpf: z.string().min(1, 'CPF obrigatório.'),
  rg: z.string().optional().nullable(),

  // birthdate (canonical) OR birth (frontend)
  birthdate: dateLike.optional(),
  birth: z.string().optional(),

  gender: z.enum(['Feminino', 'Masculino', 'Outro']).optional().nullable(),
  phone: z.string().min(1, 'Telefone obrigatório.'),
  email: z.string().email('E-mail inválido.').optional().nullable().or(z.literal('')),
  cep: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  uf: z.string().max(2).optional().nullable(),
  status: z.enum(['ativo', 'inativo']).optional().default('ativo'),
  planId: z.string().optional().nullable(),

  // allergies / conditions — array or comma string; aliases *Text
  allergies: arrayLike,
  allergiesText: z.string().optional(),
  conditions: arrayLike,
  conditionsText: z.string().optional(),

  // observations (canonical) OR obs (frontend)
  observations: z.string().optional().nullable(),
  obs: z.string().optional().nullable(),

  isMinor: z.coerce.boolean().optional().default(false),
  responsibleParty: z.string().optional().nullable(),
  responsible: z.string().optional().nullable(),
  responsiblePhone: z.string().optional().nullable(),
});

// Normalize aliases into canonical fields.
function normalize(data: z.infer<typeof baseObject>) {
  // Prefer the editable "birth" (YYYY-MM-DD) field, parsed as a local date.
  const birthdate = data.birth ? parseYmdLocal(data.birth) : data.birthdate;
  const allergies = data.allergies ?? (data.allergiesText
    ? data.allergiesText.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined);
  const conditions = data.conditions ?? (data.conditionsText
    ? data.conditionsText.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined);

  return {
    name: data.name,
    cpf: data.cpf,
    rg: data.rg ?? null,
    birthdate,
    gender: data.gender ?? null,
    phone: data.phone,
    email: data.email || null,
    cep: data.cep ?? null,
    address: data.address ?? null,
    city: data.city ?? null,
    uf: data.uf ?? 'SP',
    status: data.status ?? 'ativo',
    planId: data.planId || null,
    allergies,
    conditions,
    observations: data.observations ?? data.obs ?? null,
    isMinor: data.isMinor ?? false,
    responsibleParty: data.responsibleParty ?? data.responsible ?? null,
    responsiblePhone: data.responsiblePhone ?? null,
  };
}

export const createPatientSchema = baseObject
  .refine((d) => d.birthdate || d.birth, { message: 'Data de nascimento obrigatória.', path: ['birthdate'] })
  .transform(normalize);

// Update: all fields optional (partial). Only fields actually present in the
// request body are included in the output — the same approach used by
// updateServiceSchema and updatePlanSchema — so absent fields never overwrite
// existing DB values with defaults (e.g. planId would be set to null, status to
// 'ativo', uf to 'SP', isMinor to false if we ran normalize() unconditionally).
export const updatePatientSchema = baseObject.partial().transform((d) => {
  const cleaned: Record<string, unknown> = {};

  if (d.name !== undefined) cleaned.name = d.name;
  if (d.cpf !== undefined) cleaned.cpf = d.cpf;
  if (d.rg !== undefined) cleaned.rg = d.rg ?? null;

  // birthdate: prefer the "birth" (YYYY-MM-DD) string field
  if (d.birth !== undefined) cleaned.birthdate = parseYmdLocal(d.birth);
  else if (d.birthdate !== undefined) cleaned.birthdate = d.birthdate;

  if (d.gender !== undefined) cleaned.gender = d.gender ?? null;
  if (d.phone !== undefined) cleaned.phone = d.phone;
  if (d.email !== undefined) cleaned.email = d.email || null;
  if (d.cep !== undefined) cleaned.cep = d.cep ?? null;
  if (d.address !== undefined) cleaned.address = d.address ?? null;
  if (d.city !== undefined) cleaned.city = d.city ?? null;
  if (d.uf !== undefined) cleaned.uf = d.uf ?? null;
  if (d.status !== undefined) cleaned.status = d.status;
  if (d.planId !== undefined) cleaned.planId = d.planId || null;

  // allergies / conditions — support both array and comma-string aliases
  const allergies = d.allergies ?? (d.allergiesText
    ? d.allergiesText.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined);
  if (allergies !== undefined) cleaned.allergies = allergies;

  const conditions = d.conditions ?? (d.conditionsText
    ? d.conditionsText.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined);
  if (conditions !== undefined) cleaned.conditions = conditions;

  // observations — support the "obs" alias
  if (d.observations !== undefined || d.obs !== undefined)
    cleaned.observations = d.observations ?? d.obs ?? null;

  if (d.isMinor !== undefined) cleaned.isMinor = d.isMinor;

  // responsibleParty — support the "responsible" alias
  if (d.responsibleParty !== undefined || d.responsible !== undefined)
    cleaned.responsibleParty = d.responsibleParty ?? d.responsible ?? null;

  if (d.responsiblePhone !== undefined) cleaned.responsiblePhone = d.responsiblePhone ?? null;

  return cleaned;
});

export const listPatientsQuerySchema = z.object({
  search: z.string().optional(),
  q: z.string().optional(), // alias
  status: z.enum(['ativo', 'inativo', 'all']).optional(),
  planId: z.string().optional(),
  sort: z.enum(['name', 'age', 'lastVisit', 'status', 'createdAt']).optional().default('name'),
  dir: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
