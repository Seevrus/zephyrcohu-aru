import { CompanyType } from './common/CompanyType';
import { UserType } from './common/UserType';

export type SelectStoreResponseType = UserType & {
  company: CompanyType;
};
