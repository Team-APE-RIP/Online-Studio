import { ProjectType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @IsString()
  @IsNotEmpty()
  repositoryId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  slug!: string;

  @IsEnum(ProjectType)
  type!: ProjectType;

  @IsOptional()
  @IsString()
  description?: string;
}