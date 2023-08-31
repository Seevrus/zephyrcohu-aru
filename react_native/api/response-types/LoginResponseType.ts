import { CompanyType } from './common/CompanyType';
import { UserRoleType } from './common/UserRoleType';
import { UserType } from './common/UserType';

export type LoginResponse = UserType & {
  company: CompanyType;
  token: Token;
};

export type Token = {
  tokenType: string;
  accessToken: string;
  abilities: UserRoleType[] | ['password'];
  expiresAt: string;
};
