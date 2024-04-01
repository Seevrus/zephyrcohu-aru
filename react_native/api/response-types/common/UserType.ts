import { type TimeStamps } from './TimeStamps';
import { type UserRoleType } from './UserRoleType';

export type UserType = {
  id: number;
  userName: string;
  state: 'I' | 'L' | 'R';
  name: string;
  phoneNumber: string;
  roles: UserRoleType[];
  storeId: number | null;
  lastActive: string; // UTC
} & TimeStamps;
