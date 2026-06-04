import type { DentalRecord } from '@prisma/client';
import { prisma } from '../../shared/prisma';
import { NotFound } from '../../shared/errors';
import type { DentalRecordDTO } from './types';

function serialize(r: DentalRecord): DentalRecordDTO {
  return {
    id: r.id,
    patientId: r.patientId,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export const dentalRecordService = {
  /** Get the patient's dental record, creating an empty one on first access. */
  async get(patientId: string): Promise<DentalRecordDTO> {
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw NotFound('Paciente');

    let record = await prisma.dentalRecord.findUnique({ where: { patientId } });
    if (!record) {
      record = await prisma.dentalRecord.create({ data: { patientId, notes: '' } });
    }
    return serialize(record);
  },

  /** Upsert the patient's dental record notes. */
  async update(patientId: string, notes: string | null): Promise<DentalRecordDTO> {
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw NotFound('Paciente');

    const record = await prisma.dentalRecord.upsert({
      where: { patientId },
      create: { patientId, notes: notes ?? '' },
      update: { notes: notes ?? '' },
    });
    return serialize(record);
  },
};
