import {
  ExecutionContext,
  Injectable,
  CanActivate,
  Inject,
  ContextType,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { Config } from './config';
import { IsPublicMetaKey } from '@anyit/nestjs-is-public-decorator';

@Injectable()
export class ContextAuthGuard implements CanActivate {
  constructor(@Inject(Reflector) private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride(IsPublicMetaKey, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const isGraphql = context.getType<ContextType | 'graphql'>() === 'graphql';
    if (isGraphql) {
      return ContextAuthGuard.validateGraphQlContext(context);
    } else {
      return ContextAuthGuard.validateRestContext(context);
    }
  }

  private static validateGraphQlContext(context: ExecutionContext) {
    const { error } = GqlExecutionContext.create(context).getContext();
    if (error) {
      throw new GraphQLError(error.message, {
        extensions: { code: error.code },
      });
    }
    return true;
  }

  private static validateRestContext(context: ExecutionContext) {
    const authHeader =
      context
        .switchToHttp()
        .getRequest()
        .header(Config.auth.authContextHeader) || '{}';

    const { error } = JSON.parse(authHeader);

    if (error) {
      throw new UnauthorizedException(error);
    }
    return true;
  }
}
