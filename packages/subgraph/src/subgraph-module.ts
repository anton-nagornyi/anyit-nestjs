import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { ApolloServerPluginInlineTraceDisabled } from '@apollo/server/plugin/disabled';
import { setAuthorizationContext } from './set-authorization-context';
import { Context, ContextSetter } from './shared-types';

const getContextFromSetters = (
  input: any,
  contextSetters: ContextSetter[],
): Context => {
  let context: Context = {};
  for (const setter of contextSetters) {
    context = setter(input, context);
    if (context.error) {
      break;
    }
  }

  return context;
};

export type SubgraphModuleOptions = {
  autoSchemaFile?: string;
  enablePlayground?: boolean;
  enableIntrospection?: boolean;
  enableTracing?: boolean;
  setContext?: ContextSetter;
  contextSettersChain?: (contextSetters: ContextSetter[]) => ContextSetter[];
};
export class SubgraphModule {
  static forRoot(options: SubgraphModuleOptions) {
    const {
      enablePlayground = false,
      enableIntrospection = false,
      enableTracing = false,
      autoSchemaFile = 'schema.gql',
      setContext,
      contextSettersChain,
    } = options;

    const tracingPlugins = enableTracing
      ? [ApolloServerPluginInlineTrace()]
      : [ApolloServerPluginInlineTraceDisabled()];
    const playgroundPlugins = enablePlayground
      ? [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
      : [];

    const contextSetters = contextSettersChain
      ? contextSettersChain([setAuthorizationContext])
      : [setAuthorizationContext];

    const contextOptions = setContext
      ? { context: setContext }
      : {
          context: (input: any) => getContextFromSetters(input, contextSetters),
        };

    return GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile,
      introspection: enableIntrospection,
      playground: false,
      transformAutoSchemaFile: true,
      plugins: [...playgroundPlugins, ...tracingPlugins],
      ...contextOptions,
      transformSchema: (schema: any) => {
        Object.keys(schema?._typeMap).forEach((key) => {
          const type = schema?._typeMap?.[key];
          type.extensionASTNodes =
            type.extensionASTNodes && type.extensionASTNodes.length > 0
              ? type.extensionASTNodes
              : undefined;
        });
        return schema;
      },
    });
  }
}
