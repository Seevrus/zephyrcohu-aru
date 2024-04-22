import { atomWithAsyncStorage } from './helpers';

export const userLoginIdentifierAtom = atomWithAsyncStorage<string | null>(
  'boreal-user-login-identifier',
  null
);
