import { GraphQLError } from 'graphql';

export class AuthFailed extends GraphQLError {
  constructor() {
    super('Unauthorized access', {
      extensions: { code: 'UNAUTHORIZED_ACCESS' },
    });
  }
}
