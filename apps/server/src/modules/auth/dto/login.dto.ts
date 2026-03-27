import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  emailOrUsername!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}