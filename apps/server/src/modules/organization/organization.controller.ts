import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import type { ApiResponse } from "@team-ape-rip/shared";
import { AuthenticatedGuard } from "../../common/authenticated.guard";
import { CurrentAuthUser } from "../../common/current-auth-user.decorator";
import type { AuthTokenPayload } from "../../common/auth-token.util";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { OrganizationService } from "./organization.service";

@Controller("organizations")
@UseGuards(AuthenticatedGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  async getOrganizations(
    @CurrentAuthUser() authUser: AuthTokenPayload,
  ): Promise<
    ApiResponse<
      Array<{
        id: string;
        membershipId: string;
        name: string;
        slug: string;
        description: string | null;
        role: string;
        repositoryCount: number;
        projectCount: number;
        createdAt: string;
        updatedAt: string;
      }>
    >
  > {
    const organizations = await this.organizationService.findForUser(authUser.sub);

    return {
      success: true,
      message: "Organizations loaded successfully",
      data: organizations.map((membership) => ({
        id: membership.organization.id,
        membershipId: membership.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        description: membership.organization.description,
        role: membership.role,
        repositoryCount: membership.organization.repositories.length,
        projectCount: membership.organization.projects.length,
        createdAt: membership.organization.createdAt.toISOString(),
        updatedAt: membership.organization.updatedAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  async createOrganization(
    @CurrentAuthUser() authUser: AuthTokenPayload,
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
    const organization = await this.organizationService.create(authUser.sub, body);

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