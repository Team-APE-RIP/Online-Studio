import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import {
  parseBearerToken,
  verifyAuthToken,
  type AuthTokenPayload,
} from "./auth-token.util";

export interface RequestWithAdminAuth {
  headers?: {
    authorization?: string;
  };
  authUser?: AuthTokenPayload;
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithAdminAuth>();
    const authorization = request.headers?.authorization;

    if (!authorization) {
      throw new UnauthorizedException("Authentication required");
    }

    const token = parseBearerToken(authorization);
    const payload = verifyAuthToken(token);

    if (payload.role !== "admin") {
      throw new ForbiddenException("Administrator access required");
    }

    request.authUser = payload;
    return true;
  }
}