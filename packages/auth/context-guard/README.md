# ContextAuthGuard

This library provides a NestJS guard, `ContextAuthGuard`, used to protect routes in both REST and GraphQL applications. 
By using custom metadata, it can distinguish between public and protected routes and ensure that requests have the necessary
context for authorization.

## Installation

Ensure you have NestJS installed in your project. If not, you can install it using yarn:

```bash
yarn add @nestjs/common @nestjs/core graphql @nestjs/graphql
```

And then install the `@anyit/nestjs-is-public-decorator` if it's not already in your project:

```bash
yarn add @anyit/nestjs-is-public-decorator
```
## Configuration

Define the header name for your authentication context. The default header is `x-anyit-auth`, but it can be overridden 
by setting the `AUTH_CONTEXT_HEADER` environment variable.

## Usage

To use the `ContextAuthGuard`, you first need to set it up as a provider in your module.

### 1. Setup as Provider

In your module's providers array, add the `ContextAuthGuard`:

```typescript
import { ContextAuthGuard } from '@anyit/nestjs-context-guard';

@Module({
// ... Other module properties
providers: [ContextAuthGuard],
})
export class YourModule {}
```

### 2. Use the Guard

You can use the guard at a controller level or at a route handler level using the `@UseGuards` decorator.

```typescript
import { Controller, UseGuards, Post } from '@nestjs/common';
import { ContextAuthGuard } from '@anyit/nestjs-context-guard';

@Controller('your-route')
export class YourController {

@UseGuards(ContextAuthGuard)
@Post()
yourProtectedMethod() {
// ... method implementation
}
}
```

### 3. Mark Public Routes

To mark a route as public (bypassing the guard), use the `@IsPublic` decorator from `@anyit/nestjs-is-public-decorator`.

```typescript
import { IsPublic } from '@anyit/nestjs-is-public-decorator';

@Controller('your-route')
export class YourController {

@IsPublic()
@Post('public-endpoint')
yourPublicMethod() {
// This route is public
}
}
```

## How It Works

The `ContextAuthGuard` works as follows:

- It checks if the route is marked as public using the custom `@IsPublic` decorator. If so, it allows the request to
proceed without any further checks.
- For protected routes, it then distinguishes between GraphQL and REST contexts.
- For GraphQL, it extracts the context using the `GqlExecutionContext` and validates any errors in the context.
- For REST, it reads the authentication context from the request header specified by the `Config.auth.authContextHeader` 
(default or environment variable defined), and validates accordingly.

## Exceptions

The guard throws the following exceptions based on the context:

- `GraphQLError` with a custom error code if the GraphQL context validation fails.
- `UnauthorizedException` if the REST context validation fails.

## License

This library is typically licensed under the same terms as your main application, often the MIT license.
