import { Body, Controller, Get, Post } from "@nestjs/common";
import type { ApiResponse } from "@team-ape-rip/shared";
import { PrismaService } from "./prisma.service";

interface CreateOrganizationDto {
  name: string;
  slug: string;
  description?: string;
}

@Controller("organizations")
export class OrganizationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getOrganizations(): Promise<
    ApiResponse<
      Array<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        createdAt: string;
        updatedAt: string;
      }>
    >
  > {
    const organizations = await this.prisma.organization.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      message: "Organizations loaded successfully",
      data: organizations.map((organization) => ({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        description: organization.description,
        createdAt: organization.createdAt.toISOString(),
        updatedAt: organization.updatedAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  async createOrganization(
    @Body() body: CreateOrganizationDto,
  ): Promise<
    ApiResponse<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    const organization = await this.prisma.organization.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description ?? null,
      },
    });

    return {
      success: true,
      message: "Organization created successfully",
      data: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        description: organization.description,
        createdAt: organization.createdAt.toISOString(),
        updatedAt: organization.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }
}