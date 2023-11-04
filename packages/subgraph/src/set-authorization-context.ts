import { Config } from './config';
import { AuthFailed } from './errors/auth-failed';
import { Context, ContextSetter } from './shared-types';

export const setAuthorizationContext: ContextSetter = (
  input,
  context,
): Context => {
  const { envContext } = Config.auth;
  if (envContext) {
    return { ...context, ...envContext };
  }

  try {
    const { req } = input;

    const headerContext = req.header(Config.auth.authContextHeader);
    return { ...context, ...JSON.parse(headerContext) };
  } catch {
    throw new AuthFailed();
  }
};
