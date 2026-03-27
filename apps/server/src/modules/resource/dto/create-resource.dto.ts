import { ResourceType } from "@prisma/client";
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @IsString()
  @IsNotEmpty()
  repositoryId!: string;

  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsEnum(ResourceType)
  type!: ResourceType;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  slug!: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;
}