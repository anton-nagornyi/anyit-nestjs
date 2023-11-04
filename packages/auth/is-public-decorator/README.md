# IsPublic Decorator Library Documentation

The `IsPublic` decorator is a simple, yet essential part of the security and access control system within applications
that utilize NestJS. It marks certain routes or handlers as "public", meaning they can be accessed without
authentication or other access controls that might be in place.

## Overview

The `IsPublic` decorator utilizes NestJS's custom decorator capabilities to set metadata on route handlers. It uses the
`SetMetadata` function from the `@nestjs/common` package to assign metadata that can be read by guards or interceptors
during the request lifecycle.

### MetaKey

- `IsPublicMetaKey`: A constant string that serves as the identifier for the metadata.

### Usage

To make a route handler public, you simply add the `@IsPublic()` decorator to your controller's route handler method.

Example:

```typescript
import { Controller, Get } from '@nestjs/common';
import { IsPublic } from '@anyit/nestjs-is-public-decorator';

@Controller('health')
export class HealthController {
  @Get()
  @IsPublic()
  check() {
    return { status: 'up' };
  }
}
```

In the example above, the `check` method in the `HealthController` is marked as public. This means that when an
authentication guard is set up globally, this particular route will bypass that guard.

### Implementation Details

The `IsPublic` decorator sets a custom metadata key (`IsPublicMetaKey`) with a value of `true` on the route handler it
decorates.

Here's a look at the implementation:

```typescript
import { SetMetadata } from '@nestjs/common';

export const IsPublicMetaKey = 'isPublic';

export const IsPublic = () => SetMetadata(IsPublicMetaKey, true);
```

Note that `IsPublicMetaKey` is a string literal that corresponds to the metadata key. It's crucial that the `IsPublic`
decorator and the guard or interceptor that reads the metadata agree on this key.

### Integration with Guards

To leverage the `IsPublic` decorator, you would typically create a guard that checks for the presence of the
`IsPublicMetaKey` metadata. If it's set to `true`, the guard allows the request to pass through without authentication.

Here's a simple example of how a guard might check for this:

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IsPublicMetaKey } from '@anyit/nestjs-is-public-decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>(IsPublicMetaKey, context.getHandler());
    if (isPublic) {
      return true;
    }
    // ... Rest of the authentication logic
  }
}
```
