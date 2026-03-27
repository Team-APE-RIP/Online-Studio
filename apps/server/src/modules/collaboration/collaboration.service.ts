import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrganizationRole } from "@prisma/client";
import { AuthTokenPayload } from "../../common/auth-token.util";
import { OrganizationAccessService } from "../../common/organization-access.service";
import { PrismaService } from "../../prisma.service";

interface PresenceUser {
  userId: string;
  username: string;
  email: string;
  joinedAt: string;
}

@Injectable()
export class CollaborationService {
  private readonly presenceByResource = new Map<
    string,
    Map<string, PresenceUser>
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async getResourceSnapshot(resourceId: string, authUser: AuthTokenPayload) {
    const resource = await this.prisma.resource.findUnique({
      where: {
        id: resourceId,
      },
    });

    if (!resource) {
      throw new NotFoundException("Resource was not found");
    }

    await this.organizationAccessService.requireRole(
      authUser.sub,
      resource.organizationId,
      OrganizationRole.viewer,
    );

    return {
      id: resource.id,
      organizationId: resource.organizationId,
      projectId: resource.projectId,
      type: resource.type,
      title: resource.title,
      slug: resource.slug,
      summary: resource.summary,
      content: (resource.content ?? {}) as Record<string, unknown>,
      revision: resource.updatedAt.toISOString(),
      updatedAt: resource.updatedAt.toISOString(),
    };
  }

  addPresence(resourceId: string, socketId: string, authUser: AuthTokenPayload) {
    const resourcePresence =
      this.presenceByResource.get(resourceId) ?? new Map<string, PresenceUser>();

    resourcePresence.set(socketId, {
      userId: authUser.sub,
      username: authUser.username,
      email: authUser.email,
      joinedAt: new Date().toISOString(),
    });

    this.presenceByResource.set(resourceId, resourcePresence);

    return this.getPresence(resourceId);
  }

  removePresence(resourceId: string, socketId: string) {
    const resourcePresence = this.presenceByResource.get(resourceId);

    if (!resourcePresence) {
      return [];
    }

    resourcePresence.delete(socketId);

    if (resourcePresence.size === 0) {
      this.presenceByResource.delete(resourceId);
      return [];
    }

    return this.getPresence(resourceId);
  }

  removeSocketFromAllResources(socketId: string) {
    const affectedResourceIds: string[] = [];

    for (const [resourceId, resourcePresence] of this.presenceByResource.entries()) {
      if (resourcePresence.has(socketId)) {
        resourcePresence.delete(socketId);
        affectedResourceIds.push(resourceId);

        if (resourcePresence.size === 0) {
          this.presenceByResource.delete(resourceId);
        }
      }
    }

    return affectedResourceIds.map((resourceId) => ({
      resourceId,
      presence: this.getPresence(resourceId),
    }));
  }

  getPresence(resourceId: string) {
    const resourcePresence = this.presenceByResource.get(resourceId);

    if (!resourcePresence) {
      return [];
    }

    return Array.from(resourcePresence.values());
  }

  async updateResourceContent(params: {
    resourceId: string;
    authUser: AuthTokenPayload;
    content: Record<string, unknown>;
    baseRevision?: string;
  }) {
    const { resourceId, authUser, content, baseRevision } = params;

    const existingResource = await this.prisma.resource.findUnique({
      where: {
        id: resourceId,
      },
    });

    if (!existingResource) {
      throw new NotFoundException("Resource was not found");
    }

    await this.organizationAccessService.requireRole(
      authUser.sub,
      existingResource.organizationId,
      OrganizationRole.editor,
    );

    const currentRevision = existingResource.updatedAt.toISOString();

    if (baseRevision && baseRevision !== currentRevision) {
      throw new ForbiddenException("Resource revision conflict");
    }

    const updatedResource = await this.prisma.resource.update({
      where: {
        id: resourceId,
      },
      data: {
        content: content as never,
      },
    });

    return {
      id: updatedResource.id,
      projectId: updatedResource.projectId,
      organizationId: updatedResource.organizationId,
      content: (updatedResource.content ?? {}) as Record<string, unknown>,
      revision: updatedResource.updatedAt.toISOString(),
      updatedAt: updatedResource.updatedAt.toISOString(),
      updatedBy: {
        userId: authUser.sub,
        username: authUser.username,
      },
    };
  }
}