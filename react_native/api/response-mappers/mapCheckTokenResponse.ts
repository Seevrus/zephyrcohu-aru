import { omit } from 'ramda';

import { type LoginResponse } from '../response-types/LoginResponseType';

export type CheckToken = Omit<
  LoginResponse,
  'createdAt' | 'updatedAt' | 'lastActive' | 'token'
>;

export function mapCheckTokenResponse(
  loginResponse: LoginResponse
): CheckToken {
  return omit(['createdAt', 'updatedAt', 'lastActive', 'token'], loginResponse);
}
