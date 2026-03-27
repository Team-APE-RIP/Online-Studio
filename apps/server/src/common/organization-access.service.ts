import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrganizationRole } from "@prisma/client";
import { PrismaService } from "../prisma.service";

const ROLE_PRIORITY: Record<OrganizationRole, number> = {
  owner: 100,
  admin: 90,
  maintainer: 70,
  editor: 50,
  viewer: 20,
  guest: 10,
};

@Injectable()
export class OrganizationAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getMembership(userId: string, organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new NotFoundException("Organization was not found");
    }

    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return {
      organization,
      membership,
    };
  }

  async requireRole(
    userId: string,
    organizationId: string,
    minimumRole: OrganizationRole,
  ) {
    const { organization, membership } = await this.getMembership(
      userId,
      organizationId,
    );

    if (!membership) {
      throw new ForbiddenException("You are not a member of this organization");
    }

    const currentPriority = ROLE_PRIORITY[membership.role];
    const requiredPriority = ROLE_PRIORITY[minimumRole];

    if (currentPriority < requiredPriority) {
      throw new ForbiddenException(
        `Insufficient organization role. Required: ${minimumRole}`,
      );
    }

    return {
      organization,
      membership,
    };
  }
}