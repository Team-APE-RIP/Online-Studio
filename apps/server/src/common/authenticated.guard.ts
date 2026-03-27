import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { parseBearerToken, verifyAuthToken, type AuthTokenPayload } from "./auth-token.util";

export interface RequestWithAuth {
  headers?: {
    authorization?: string;
  };
  authUser?: AuthTokenPayload;
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const authorization = request.headers?.authorization;

    if (!authorization) {
      throw new UnauthorizedException("Authentication required");
    }

    const token = parseBearerToken(authorization);
    const payload = verifyAuthToken(token);

    request.authUser = payload;
    return true;
  }
}