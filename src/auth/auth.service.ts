import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { UsersService } from '../users/users.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditLogService: AuditLogService,
  ) {}

  async login(email: string, password: string, twoFactorCode?: string, meta?: { ip?: string; device?: string }) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return { requiresTwoFactor: true };
      }
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret as string,
        encoding: 'base32',
        token: twoFactorCode,
        window: 1,
      });
      if (!verified) {
        throw new UnauthorizedException('Неверный код двухфакторной аутентификации');
      }
    }

    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
    });

    await this.usersService.setLastLogin(user.id);
    await this.auditLogService.log({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      device: meta?.device,
      ip: meta?.ip,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        clientId: user.clientId,
      },
    };
  }

  private async issueTokens(payload: JwtPayload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setRefreshTokenHash(payload.sub, refreshTokenHash);
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Недействительный refresh token');
    }
    const user = await this.usersService.findByEmail(payload.email);
    if (!user || !user.refreshTokenHash || !user.isActive) {
      throw new UnauthorizedException('Сессия недействительна');
    }
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Сессия недействительна');
    }
    return this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
    });
  }

  async logout(userId: string) {
    await this.usersService.setRefreshTokenHash(userId, null);
    return { success: true };
  }

  async setupTwoFactor(userId: string, email: string) {
    const secret = speakeasy.generateSecret({
      name: `WB Fulfillment (${email})`,
    });
    await this.usersService.setTwoFactorSecret(userId, secret.base32);
    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url as string);
    return { secret: secret.base32, qrCodeDataUrl };
  }

  async confirmTwoFactor(userId: string, secret: string, code: string) {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!verified) {
      throw new BadRequestException('Неверный код. Проверьте приложение-аутентификатор.');
    }
    return this.usersService.enableTwoFactor(userId);
  }

  async disableTwoFactor(userId: string) {
    return this.usersService.disableTwoFactor(userId);
  }
}
