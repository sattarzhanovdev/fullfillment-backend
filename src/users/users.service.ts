import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  clientId?: string | null;
}

export interface UpdateUserInput {
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
  clientId?: string | null;
  password?: string;
}

const SAFE_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  clientId: true,
  isActive: true,
  twoFactorEnabled: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(input: CreateUserInput) {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        role: input.role,
        clientId: input.clientId ?? null,
      },
      select: SAFE_SELECT,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({ select: SAFE_SELECT, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, input: UpdateUserInput) {
    const data: Record<string, unknown> = { ...input };
    if (input.password) {
      data.passwordHash = await bcrypt.hash(input.password, 10);
      delete data.password;
    }
    return this.prisma.user.update({ where: { id }, data, select: SAFE_SELECT });
  }

  async remove(id: string) {
    return this.prisma.user.update({ where: { id }, data: { isActive: false }, select: SAFE_SELECT });
  }

  async setRefreshTokenHash(id: string, hash: string | null) {
    return this.prisma.user.update({ where: { id }, data: { refreshTokenHash: hash } });
  }

  async setLastLogin(id: string) {
    return this.prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  }

  async setTwoFactorSecret(id: string, secret: string | null) {
    return this.prisma.user.update({ where: { id }, data: { twoFactorSecret: secret } });
  }

  async enableTwoFactor(id: string) {
    return this.prisma.user.update({ where: { id }, data: { twoFactorEnabled: true }, select: SAFE_SELECT });
  }

  async disableTwoFactor(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
      select: SAFE_SELECT,
    });
  }
}
