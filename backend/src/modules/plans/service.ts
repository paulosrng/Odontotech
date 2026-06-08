import type { Plan, Prisma } from '@prisma/client';
import { prisma } from '../../shared/prisma';
import { NotFound } from '../../shared/errors';
import type { PlanDTO } from './types';

export function serializePlan(p: Plan): PlanDTO {
  let serviceIds: string[] = [];
  try { serviceIds = JSON.parse(p.serviceIds); } catch { /* keep [] */ }
  return {
    id: p.id,
    name: p.name,
    coveragePercent: p.coveragePercent,
    coverage: p.coveragePercent,
    status: p.status,
    gracePeriod: p.gracePeriod,
    carencia: p.gracePeriod,
    color: p.color,
    serviceCount: serviceIds.length || p.serviceCount,
    services: serviceIds.length || p.serviceCount,
    serviceIds,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export const planService = {
  async list(params: { status?: string; skip: number; take: number }) {
    const where: Prisma.PlanWhereInput = {};
    if (params.status && params.status !== 'all') where.status = params.status;

    const [rows, total] = await Promise.all([
      prisma.plan.findMany({ where, orderBy: { name: 'asc' }, skip: params.skip, take: params.take }),
      prisma.plan.count({ where }),
    ]);
    return { data: rows.map(serializePlan), total };
  },

  async create(data: {
    name: string;
    coveragePercent: number;
    status: string;
    gracePeriod: string | null;
    color: string | null;
    serviceCount: number;
  }) {
    const p = await prisma.plan.create({ data });
    return serializePlan(p);
  },

  async update(id: string, data: Record<string, unknown>) {
    const p = await prisma.plan.update({ where: { id }, data }).catch(() => {
      throw NotFound('Plano');
    });
    return serializePlan(p);
  },

  async remove(id: string) {
    // Detach patients first to satisfy FK, then delete.
    await prisma.patient.updateMany({ where: { planId: id }, data: { planId: null } });
    await prisma.plan.delete({ where: { id } }).catch(() => {
      throw NotFound('Plano');
    });
  },
};
