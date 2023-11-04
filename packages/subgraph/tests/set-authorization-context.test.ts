import { setAuthorizationContext } from '../src/set-authorization-context';
import { Config } from '../src/config';
import { AuthFailed } from '../src/errors/auth-failed';

describe('Given a function to set the authorization context', () => {
  const mockInput = {
    req: {
      header: jest.fn(),
    },
  };

  const mockContext = { existingContext: 1 };

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('When envContext is defined in the Config', () => {
    beforeAll(() => {
      Config.auth.envContext = { user: 'envUser' };
    });

    afterAll(() => {
      delete Config.auth.envContext;
    });

    it('Then it should return the merged context with envContext', () => {
      const result = setAuthorizationContext(mockInput, mockContext);
      expect(result).toEqual({ existingContext: 1, user: 'envUser' });
    });
  });

  describe('When envContext is not defined and header is correctly formatted', () => {
    beforeEach(() => {
      Config.auth.envContext = undefined;
      mockInput.req.header.mockReturnValue('{"user": "headerUser"}');
    });

    it('Then it should return the merged context with parsed headerContext', () => {
      const result = setAuthorizationContext(mockInput, mockContext);
      expect(result).toEqual({ existingContext: 1, user: 'headerUser' });
    });
  });

  describe('When envContext is not defined and header is missing', () => {
    beforeEach(() => {
      Config.auth.envContext = undefined;
      mockInput.req.header.mockReturnValue(undefined);
    });

    it('Then it should throw an AuthFailed error', () => {
      expect(() => setAuthorizationContext(mockInput, mockContext)).toThrow(
        AuthFailed,
      );
    });
  });

  describe('When envContext is not defined and header is incorrectly formatted', () => {
    beforeEach(() => {
      Config.auth.envContext = undefined;
      mockInput.req.header.mockReturnValue('not a json');
    });

    it('Then it should throw an AuthFailed error', () => {
      expect(() => setAuthorizationContext(mockInput, mockContext)).toThrow(
        AuthFailed,
      );
    });
  });
});
