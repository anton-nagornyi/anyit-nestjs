import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { UnauthorizedException } from '@nestjs/common';
import { ContextAuthGuard } from '../src/context-auth-guard';

const createMockExecutionContext = (
  type: 'http' | 'graphql',
  contextHeader?: string,
) => {
  return {
    getClass: jest.fn(),
    getHandler: jest.fn(),
    getArgs: jest.fn().mockReturnValue([]),
    getType: jest.fn().mockReturnValue(type),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        header: jest.fn().mockReturnValue(contextHeader),
      }),
    }),
    getContext: jest.fn().mockReturnValue({}),
    // ... other necessary mock properties and functions ...
  };
};

describe('Given a ContextAuthGuard', () => {
  let guard: ContextAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new ContextAuthGuard(reflector);
  });

  describe('When the handler is public', () => {
    beforeEach(() => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    });

    describe('And the context type is REST', () => {
      it('Then it should allow access without validating the context', () => {
        const context = createMockExecutionContext('http');
        expect(guard.canActivate(context as any)).toBe(true);
      });
    });

    describe('And the context type is GraphQL', () => {
      it('Then it should allow access without validating the context', () => {
        const context = createMockExecutionContext('graphql');
        expect(guard.canActivate(context as any)).toBe(true);
      });
    });
  });

  describe('When the handler is not public', () => {
    beforeEach(() => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    });

    describe('And the context type is REST', () => {
      describe('And the authentication header is valid', () => {
        it('Then it should allow access', () => {
          const context = createMockExecutionContext(
            'http',
            '{ "user": "authenticated" }',
          );
          expect(guard.canActivate(context as any)).toBe(true);
        });
      });

      describe('And the authentication header is invalid', () => {
        it('Then it should throw an UnauthorizedException', () => {
          const context = createMockExecutionContext(
            'http',
            '{ "error": "Unauthorized" }',
          );
          expect(() => guard.canActivate(context as any)).toThrow(
            UnauthorizedException,
          );
        });
      });
    });

    describe('And the context type is GraphQL', () => {
      describe('And the GraphQL context is valid', () => {
        it('Then it should allow access', () => {
          const context = createMockExecutionContext('graphql');
          // Assume the GraphQL context has a valid user in the context
          GqlExecutionContext.create = jest.fn().mockReturnValue(context);
          expect(guard.canActivate(context as any)).toBe(true);
        });
      });

      describe('And the GraphQL context is invalid', () => {
        it('Then it should throw a GraphQLError', () => {
          const context = createMockExecutionContext('graphql');
          // Assume the GraphQL context has an error in the context
          context.getContext.mockReturnValue({
            error: { message: 'Unauthorized', code: 'UNAUTHENTICATED' },
          });
          GqlExecutionContext.create = jest.fn().mockReturnValue(context);
          expect(() => guard.canActivate(context as any)).toThrow(GraphQLError);
        });
      });
    });
  });
});
