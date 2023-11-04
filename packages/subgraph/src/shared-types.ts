export type Context = Record<string, any>;
export type ContextSetter = (input: any, context: Context) => Context;
