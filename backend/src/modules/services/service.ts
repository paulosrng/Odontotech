import type { Prisma, Service } from '@prisma/client';
import { prisma } from '../../shared/prisma';
import { NotFound } from '../../shared/errors';
import type { ServiceDTO } from './types';

export function serializeService(s: Service): ServiceDTO {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    desc: s.description,
    price: s.price,
    duration: s.duration,
    dur: s.duration,
    category: s.category,
    cat: s.category,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export const serviceService = {
  async list(params: { clinicId: string; search?: string; category?: string; skip: number; take: number }) {
    const where: Prisma.ServiceWhereInput = { clinicId: params.clinicId };
    if (params.search) where.name = { contains: params.search };
    if (params.category && params.category !== 'all') where.category = params.category;

    const [rows, total] = await Promise.all([
      prisma.service.findMany({ where, orderBy: { name: 'asc' }, skip: params.skip, take: params.take }),
      prisma.service.count({ where }),
    ]);
    return { data: rows.map(serializeService), total };
  },

  async create(clinicId: string, data: { name: string; description: string | null; price: number; duration: number; category: string }) {
    const s = await prisma.service.create({ data: { ...data, clinicId } });
    return serializeService(s);
  },

  async update(id: string, data: Record<string, unknown>) {
    const s = await prisma.service
      .update({ where: { id }, data })
      .catch(() => {
        throw NotFound('Serviço');
      });
    return serializeService(s);
  },

  async remove(id: string) {
    await prisma.service.delete({ where: { id } }).catch(() => {
      throw NotFound('Serviço');
    });
  },
};
