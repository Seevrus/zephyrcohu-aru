import { type CompanyType } from './common/CompanyType';
import { type RoundType } from './common/RoundType';
import { type UserRoleType } from './common/UserRoleType';
import { type UserType } from './common/UserType';

export type LoginResponse = UserType & {
  company: CompanyType;
  round: RoundType | null;
  token: Token;
};

export type Token = {
  tokenType: string;
  accessToken: string;
  abilities: UserRoleType[] | ['password'];
  expiresAt: string;
};
