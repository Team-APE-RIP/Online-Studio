import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ResourceType, type ApiResponse } from "@team-ape-rip/shared";
import { CurrentAuthUser } from "../../common/current-auth-user.decorator";
import { AuthenticatedGuard } from "../../common/authenticated.guard";
import type { AuthTokenPayload } from "../../common/auth-token.util";
import { CreateResourceDto } from "./dto/create-resource.dto";
import { UpdateResourceDto } from "./dto/update-resource.dto";
import { ResourceService } from "./resource.service";

@Controller("resources")
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  async getResources(
    @Query("projectId") projectId?: string,
  ): Promise<
    ApiResponse<
      Array<{
        id: string;
        organizationId: string;
        projectId: string;
        projectName: string;
        type: ResourceType;
        title: string;
        slug: string;
        summary: string | null;
        createdAt: string;
        updatedAt: string;
      }>
    >
  > {
    const resources = await this.resourceService.findAll(projectId);

    return {
      success: true,
      message: "Resources loaded successfully",
      data: resources.map((resource) => ({
        id: resource.id,
        organizationId: resource.organizationId,
        projectId: resource.projectId,
        projectName: resource.project.name,
        type: resource.type as ResourceType,
        title: resource.title,
        slug: resource.slug,
        summary: resource.summary,
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  async createResource(
    @Body() body: CreateResourceDto,
    @CurrentAuthUser() authUser?: AuthTokenPayload,
  ): Promise<
    ApiResponse<{
      id: string;
      organizationId: string;
      projectId: string;
      type: ResourceType;
      title: string;
      slug: string;
      summary: string | null;
      createdAt: string;
      updatedAt: string;
      revision: string;
    }>
  > {
    const resource = await this.resourceService.create(body, authUser?.sub);

    return {
      success: true,
      message: "Resource created successfully",
      data: {
        id: resource.id,
        organizationId: resource.organizationId,
        projectId: resource.projectId,
        type: resource.type as ResourceType,
        title: resource.title,
        slug: resource.slug,
        summary: resource.summary,
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString(),
        revision: resource.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(":id")
  @UseGuards(AuthenticatedGuard)
  async updateResource(
    @Param("id") id: string,
    @Body() body: UpdateResourceDto,
    @CurrentAuthUser() authUser?: AuthTokenPayload,
  ): Promise<
    ApiResponse<{
      id: string;
      organizationId: string;
      projectId: string;
      type: ResourceType;
      title: string;
      slug: string;
      summary: string | null;
      createdAt: string;
      updatedAt: string;
      revision: string;
    }>
  > {
    const resource = await this.resourceService.update(id, body, authUser?.sub);

    return {
      success: true,
      message: "Resource updated successfully",
      data: {
        id: resource.id,
        organizationId: resource.organizationId,
        projectId: resource.projectId,
        type: resource.type as ResourceType,
        title: resource.title,
        slug: resource.slug,
        summary: resource.summary,
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString(),
        revision: resource.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }
}