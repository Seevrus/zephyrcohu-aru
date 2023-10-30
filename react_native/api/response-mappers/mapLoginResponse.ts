import { assocPath } from 'ramda';
import {
  type LoginResponse,
  type Token,
} from '../response-types/LoginResponseType';

type Login = LoginResponse & {
  token: Token & {
    isPasswordExpired: boolean;
  };
};

export function mapLoginResponse(loginResponse: LoginResponse): Login {
  // TS does not have a way to synthetize this union type
  const isPasswordExpired = loginResponse.token.abilities.includes(
    'password' as never
  );

  return assocPath(
    ['token', 'isPasswordExpired'],
    isPasswordExpired,
    loginResponse
  ) as Login;
}
