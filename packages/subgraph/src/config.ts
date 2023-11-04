const auth = {
  authContextHeader: process.env.AUTH_CONTEXT_HEADER ?? 'x-anyit-auth',
  envContext: process.env.ENV_AUTH_CONTEXT
    ? JSON.parse(process.env.ENV_AUTH_CONTEXT)
    : undefined,
};

export const Config = {
  auth,
};
