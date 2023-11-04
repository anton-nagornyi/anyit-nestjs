# NestJS Apollo Federation Subgraph Module

This library provides a NestJS module to configure an Apollo Federation subgraph with support for dynamic context setting 
based on authorization headers or environment variables.

## Features

- Apollo Federation support for GraphQL subgraphs.
- Dynamic context setting for authorization.
- Configurable playground and introspection.
- Optional GraphQL query tracing.
- Customizable context setters chain for additional context manipulations.

## Installation

Ensure you have the required packages installed:

```bash
yarn @nestjs/graphql @nestjs/apollo graphql @anyit/nestjs-subgraph
```

## Configuration

Define your authorization context header and any static authorization context from the environment:

```typescript
const auth = {
  authContextHeader: process.env.AUTH_CONTEXT_HEADER ?? 'x-anyit-auth',
  envContext: process.env.ENV_AUTH_CONTEXT
    ? JSON.parse(process.env.ENV_AUTH_CONTEXT)
    : undefined,
};

export const Config = {
  auth,
};
```

## Usage

Import and configure the `SubgraphModule` in your application module:

```typescript
import { SubgraphModule } from '@anyit/nestjs-subgraph';

@Module({
  imports: [
    SubgraphModule.forRoot({
      autoSchemaFile: 'path/to/your/schema.gql',
      enablePlayground: process.env.ENABLE_PLAYGROUND === 'true',
      enableIntrospection: process.env.ENABLE_INTROSPECTION === 'true',
      enableTracing: process.env.ENABLE_TRACING === 'true',
// Optionally provide a custom context setter
      setContext: (input) => ({ /* ... your custom context ... */ }),
// Optionally provide a chain of context setters
      contextSettersChain: (defaultSetters) => [...defaultSetters, additionalContextSetter],
    }),
  ],
// ... other module imports
})
export class AppModule {}
```

## Context Setters

Context setters are functions that can modify the GraphQL context for each request. They can be chained to provide 
multiple layers of context setting logic.

Here's the example of using DataLoader:

```typescript
import { Context, ContextSetter } from '@anyit/nestjs-subgraph';
import DataLoader from 'dataloader';
import { getUsersByIds } from './user.service'; // A hypothetical batch loading function.

// Create a DataLoader for user objects.
const createUserLoader = () => new DataLoader(getUsersByIds);

export const userDataLoaderContextSetter: ContextSetter = (input, context): Context => {
  // Initialize our DataLoader and add it to the context
  const userLoader = createUserLoader();

  // Here, we're spreading any existing context, then adding our userLoader to it.
  return { ...context, userLoader };
};
```

## Error Handling

The library includes a custom GraphQL error for failed authentication attempts.
This error will be thrown if the context cannot be set from either the environment variable or the authorization header.

## Default Context Behavior

By default, the `setAuthorizationContext` function is invoked for each GraphQL request to set the context. This function 
checks for authorization details and sets them in the GraphQL context. If it encounters any issues, it will record an 
error within the context.

## Customizing Context Behavior

You have two options to modify this default behavior:

1. **Use `setContext`**: By providing a `setContext` function when configuring the module, you will override the default 
context setters chain. This means that only your `setContext` function will be called, and the `setAuthorizationContext` 
will not be used unless you explicitly call it within your function.

```typescript
SubgraphModule.forRoot({
  // ... other options
  setContext: (input) => {
    // Custom logic to set the context
    // `setAuthorizationContext` will not be called unless explicitly invoked here
  },
})
```

2. **Use `contextSettersChain`**: This allows you to provide a chain of context setters. You can choose to include or 
exclude the `setAuthorizationContext` in this chain. If you exclude it, the `setAuthorizationContext` will not be called, 
and no error will be set by default.

```typescript
SubgraphModule.forRoot({
  // ... other options
  contextSettersChain: (defaultSetters) => {
    // Modify the default setters chain, optionally exclude `setAuthorizationContext`
    const customSetters = defaultSetters.filter(setter => setter !== setAuthorizationContext);
    return [...customSetters, additionalContextSetter];
  },
})
```

### Setting Context from Environment Variables

During development, it can be useful to set the context directly from an environment variable. This can be done by 
configuring the `ENV_AUTH_CONTEXT` variable. This allows for quick and temporary context changes without altering the 
code.

## Context Handling Strategy

Choose the strategy that best fits your use case:

- If you want full control over the context, use `setContext`.
- If you want to customize the sequence or the set of context setters, use `contextSettersChain`.

Both approaches allow for granular control over how the GraphQL context is constructed and managed across requests in 
your Apollo Federation subgraph.

## License

This library is licensed under the MIT license, unless specified otherwise in your project.
