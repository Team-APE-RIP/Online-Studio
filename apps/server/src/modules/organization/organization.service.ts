import { ConflictException, Injectable } from "@nestjs/common";
import { MembershipStatus, OrganizationRole } from "@prisma/client";
import { PrismaService } from "../../prisma.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string) {
    return this.prisma.organizationMember.findMany({
      where: {
        userId,
        status: MembershipStatus.active,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        organization: {
          include: {
            repositories: true,
            projects: true,
          },
        },
      },
    });
  }

  async create(userId: string, input: CreateOrganizationDto) {
    const existingOrganization = await this.prisma.organization.findUnique({
      where: {
        slug: input.slug,
      },
    });

    if (existingOrganization) {
      throw new ConflictException("Organization slug already exists");
    }

    return this.prisma.organization.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        members: {
          create: {
            userId,
            role: OrganizationRole.owner,
            status: MembershipStatus.active,
            joinedAt: new Date(),
          },
        },
      },
    });
  }
}