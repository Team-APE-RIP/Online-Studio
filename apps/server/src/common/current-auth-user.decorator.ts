import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthTokenPayload } from "./auth-token.util";
import type { RequestWithAuth } from "./authenticated.guard";

export const CurrentAuthUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthTokenPayload | undefined => {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    return request.authUser;
  },
);