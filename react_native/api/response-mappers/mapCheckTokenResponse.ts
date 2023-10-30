import { omit } from 'ramda';
import { type LoginResponse } from '../response-types/LoginResponseType';

export type CheckToken = Omit<LoginResponse, 'token'>;

export function mapCheckTokenResponse(
  loginResponse: LoginResponse
): CheckToken {
  return omit(['token'], loginResponse);
}
