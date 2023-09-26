import { UserRoleType } from './UserRoleType';

export type UserType = {
  id: number;
  code: string;
  userName: string;
  state: 'I' | 'L' | 'R';
  name: string;
  phoneNumber: string;
  roles: UserRoleType[];
  storeId: number | null;
  createdAt: string; // UTC
  updatedAt: string; // UTC
  lastActive: string; // UTC
};
