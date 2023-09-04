import { omit } from 'ramda';
import { LoginResponse } from '../response-types/LoginResponseType';

export type CheckToken = Omit<LoginResponse, 'token'>;

export default function mapCheckTokenResponse(loginResponse: LoginResponse): CheckToken {
  return omit(['token'], loginResponse);
}
