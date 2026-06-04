import bcrypt from 'bcryptjs';
import type { ClinicSettings, Prisma, User } from '@prisma/client';
import { prisma } from '../../shared/prisma';
import { BadRequest, NotFound } from '../../shared/errors';
import type { DentistDTO, SettingsDTO, UserDTO } from './types';
import type { CreateUserInput, UpdateUserInput } from './schema';

const SETTINGS_ID = 'singleton';

function serializeSettings(s: ClinicSettings): SettingsDTO {
  return {
    id: s.id,
    clinicName: s.clinicName,
    unit: s.unit,
    cnpj: s.cnpj,
    phone: s.phone,
    email: s.email,
    address: s.address,
    primaryColor: s.primaryColor,
    radius: s.radius,
    density: s.density,
    theme: s.theme,
    businessHoursStart: s.businessHoursStart,
    businessHoursEnd: s.businessHoursEnd,
    appointmentSlotMinutes: s.appointmentSlotMinutes,
    timezone: s.timezone,
    updatedAt: s.updatedAt.toISOString(),
  };
}

function serializeUser(u: User): UserDTO {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    specialty: u.specialty,
    color: u.color,
    initials: u.initials,
    active: u.active,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}

function serializeDentist(u: User): DentistDTO {
  return {
    id: u.id,
    name: u.name,
    spec: u.specialty,
    specialty: u.specialty,
    color: u.color,
    initials: u.initials,
  };
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || first.toUpperCase();
}

export const configService = {
  async getSettings(): Promise<SettingsDTO> {
    let settings = await prisma.clinicSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (!settings) {
      settings = await prisma.clinicSettings.create({ data: { id: SETTINGS_ID } });
    }
    return serializeSettings(settings);
  },

  async updateSettings(data: Record<string, unknown>): Promise<SettingsDTO> {
    if ('email' in data && data.email === '') data.email = null;
    const settings = await prisma.clinicSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...data },
      update: data,
    });
    return serializeSettings(settings);
  },

  async listUsers(params: { role?: string; search?: string }): Promise<UserDTO[]> {
    const where: Prisma.UserWhereInput = {};
    if (params.role && params.role !== 'all') where.role = params.role;
    if (params.search) where.OR = [{ name: { contains: params.search } }, { email: { contains: params.search } }];
    const users = await prisma.user.findMany({ where, orderBy: { name: 'asc' } });
    return users.map(serializeUser);
  },

  async listDentists(): Promise<DentistDTO[]> {
    // A "dentist" is any active user with a clinical specialty (role DENTIST,
    // or an ADMIN who also practices, e.g. the clinic owner).
    const users = await prisma.user.findMany({
      where: {
        active: true,
        OR: [{ role: 'DENTIST' }, { specialty: { not: null } }],
      },
      orderBy: { name: 'asc' },
    });
    return users.map(serializeDentist);
  },

  async createUser(input: CreateUserInput): Promise<UserDTO> {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) throw BadRequest('Já existe um usuário com este e-mail.');

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        role: input.role,
        specialty: input.specialty ?? null,
        color: input.color ?? null,
        initials: input.initials ?? initialsFrom(input.name),
        active: input.active ?? true,
      },
    });
    return serializeUser(user);
  },

  async updateUser(id: string, input: UpdateUserInput): Promise<UserDTO> {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw NotFound('Usuário');

    const data: Prisma.UserUncheckedUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = input.email.toLowerCase();
    if (input.role !== undefined) data.role = input.role;
    if (input.specialty !== undefined) data.specialty = input.specialty ?? null;
    if (input.color !== undefined) data.color = input.color ?? null;
    if (input.initials !== undefined) data.initials = input.initials ?? null;
    if (input.active !== undefined) data.active = input.active;
    if (input.password !== undefined) data.passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.update({ where: { id }, data });
    return serializeUser(user);
  },

  async removeUser(id: string, requesterId: string): Promise<void> {
    if (id === requesterId) throw BadRequest('Você não pode excluir o próprio usuário.');
    const dependents = await prisma.appointment.count({ where: { dentistId: id } });
    if (dependents > 0) {
      // Soft-delete dentists that have appointments to preserve history.
      await prisma.user.update({ where: { id }, data: { active: false } }).catch(() => {
        throw NotFound('Usuário');
      });
      return;
    }
    await prisma.user.delete({ where: { id } }).catch(() => {
      throw NotFound('Usuário');
    });
  },
};
