import { Injectable, NotFoundException } from "@nestjs/common";
import { ProjectType, ResourceType } from "@prisma/client";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class Hoi4ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    return this.prisma.project.findMany({
      where: {
        type: ProjectType.hoi4,
      },
      include: {
        resources: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async getProjectDetail(slug: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        slug,
        type: ProjectType.hoi4,
      },
      include: {
        resources: {
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`HOI4 project "${slug}" was not found`);
    }

    return project;
  }

  async getFocusTrees(slug: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        slug,
        type: ProjectType.hoi4,
      },
      include: {
        resources: {
          where: {
            type: ResourceType.hoi4_focus_tree,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`HOI4 project "${slug}" was not found`);
    }

    return project.resources;
  }

  async getLocalizations(slug: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        slug,
        type: ProjectType.hoi4,
      },
      include: {
        resources: {
          where: {
            type: ResourceType.hoi4_localization,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`HOI4 project "${slug}" was not found`);
    }

    return project.resources;
  }
}