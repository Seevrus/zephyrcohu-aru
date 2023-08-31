import { assocPath } from 'ramda';
import { LoginResponse, Token } from '../response-types/LoginResponseType';

export type Login = LoginResponse & {
  token: Token & {
    isPasswordExpired: boolean;
  };
};

export default function mapLoginResponse(loginResponse: LoginResponse): Login {
  // TS does not have a way to synthetize this union type
  const isPasswordExpired = loginResponse.token.abilities.includes('password' as never);

  return assocPath(['token', 'isPasswordExpired'], isPasswordExpired, loginResponse) as Login;
}
