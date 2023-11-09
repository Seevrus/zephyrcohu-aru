import { type CompanyType } from './common/CompanyType';
import { type UserType } from './common/UserType';

export type SelectStoreResponseType = UserType & {
  company: CompanyType;
};
