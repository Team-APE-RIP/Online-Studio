import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import {
  GlobalRole,
  TokenPurpose,
  UserAccountStatus,
  UserEmailStatus,
} from "@prisma/client";
import { PrismaService } from "./prisma.service";

interface RegisterInput {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

interface LoginInput {
  emailOrUsername: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(input: RegisterInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedUsername = input.username.trim().toLowerCase();

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: normalizedUsername },
          {
            emails: {
              some: {
                email: normalizedEmail,
              },
            },
          },
        ],
      },
      include: {
        emails: true,
      },
    });

    if (existingUser) {
      throw new ConflictException("Email or username already exists");
    }

    const passwordHash = this.hashPassword(input.password);

    const user = await this.prisma.user.create({
      data: {
        username: normalizedUsername,
        displayName: input.displayName.trim(),
        passwordHash,
        globalRole: GlobalRole.user,
        accountStatus: UserAccountStatus.pending_verification,
        emails: {
          create: {
            email: normalizedEmail,
            status: UserEmailStatus.pending,
            isPrimary: true,
          },
        },
      },
      include: {
        emails: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    const primaryEmail = user.emails[0];

    if (!primaryEmail) {
      throw new ConflictException("Primary email was not created");
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        primaryEmailId: primaryEmail.id,
      },
    });

    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        email: primaryEmail.email,
        purpose: TokenPurpose.email_verification,
        tokenHash: this.hashToken(`${user.id}:${primaryEmail.email}:${Date.now()}`),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    const token = this.signToken({
      sub: user.id,
      email: primaryEmail.email,
      username: user.username,
      role: user.globalRole,
    });

    return {
      token,
      user: {
        id: user.id,
        email: primaryEmail.email,
        username: user.username,
        displayName: user.displayName,
        globalRole: user.globalRole,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async login(input: LoginInput) {
    const identity = input.emailOrUsername.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: identity },
          {
            emails: {
              some: {
                email: identity,
              },
            },
          },
        ],
      },
      include: {
        emails: {
          where: {
            isPrimary: true,
          },
          take: 1,
        },
      },
    });

    if (!user || !user.passwordHash || !this.verifyPassword(input.password, user.passwordHash)) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const primaryEmail = user.emails[0];

    if (!primaryEmail) {
      throw new UnauthorizedException("Primary email was not found");
    }

    const token = this.signToken({
      sub: user.id,
      email: primaryEmail.email,
      username: user.username,
      role: user.globalRole,
    });

    return {
      token,
      user: {
        id: user.id,
        email: primaryEmail.email,
        username: user.username,
        displayName: user.displayName,
        globalRole: user.globalRole,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${derivedKey}`;
  }

  private verifyPassword(password: string, storedHash: string) {
    const [salt, originalKey] = storedHash.split(":");

    if (!salt || !originalKey) {
      return false;
    }

    const derivedKey = scryptSync(password, salt, 64).toString("hex");

    return timingSafeEqual(
      Buffer.from(originalKey, "hex"),
      Buffer.from(derivedKey, "hex"),
    );
  }

  private hashToken(value: string) {
    return createHash("sha256").update(value).digest("hex");
  }

  private signToken(payload: Record<string, unknown>) {
    const secret =
      process.env.JWT_SECRET ||
      "team-ape-rip-development-secret-change-in-production";

    const header = {
      alg: "HS256",
      typ: "JWT",
    };

    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + 60 * 60 * 24 * 7;

    const fullPayload = {
      ...payload,
      iat: issuedAt,
      exp: expiresAt,
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));
    const signature = createHmac("sha256", secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private base64UrlEncode(value: string) {
    return Buffer.from(value).toString("base64url");
  }
}