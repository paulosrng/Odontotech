import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { User } from '@prisma/client';
import { prisma } from '../../shared/prisma';
import { env } from '../../config/env';
import { Unauthorized } from '../../shared/errors';
import type { AuthResult, PublicUser, TokenPair } from './types';
import type { LoginInput } from './schema';

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    specialty: user.specialty,
    color: user.color,
    initials: user.initials,
  };
}

function signAccessToken(user: User): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpires } as jwt.SignOptions,
  );
}

async function issueTokens(user: User): Promise<TokenPair> {
  const accessToken = signAccessToken(user);

  // Opaque random refresh token persisted in DB (rotatable / revocable).
  const refreshToken = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresDays * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  return { accessToken, refreshToken, expiresIn: env.jwt.accessExpires };
}

export const authService = {
  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user || !user.active) throw Unauthorized('Credenciais inválidas.');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw Unauthorized('Credenciais inválidas.');

    const tokens = await issueTokens(user);
    return { ...tokens, user: toPublicUser(user) };
  },

  /** Validate refresh token from DB, rotate it, and return a new pair. */
  async refresh(refreshToken: string): Promise<AuthResult> {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored) throw Unauthorized('Refresh token inválido.');

    if (stored.expiresAt.getTime() < Date.now()) {
      await prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => undefined);
      throw Unauthorized('Refresh token expirado.');
    }
    if (!stored.user.active) throw Unauthorized('Usuário inativo.');

    // Rotate: delete the used token, issue a fresh pair.
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const tokens = await issueTokens(stored.user);
    return { ...tokens, user: toPublicUser(stored.user) };
  },

  /** Delete the refresh token from DB (logout). Idempotent. */
  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  },

  async me(userId: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Unauthorized();
    return toPublicUser(user);
  },
};
