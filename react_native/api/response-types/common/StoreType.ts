import { type TimeStamps } from './TimeStamps';
import { type UserType } from './UserType';

export type StoreType = {
  id: number;
  code: string;
  name: string;
  type: 'P' | 'S';
  state: 'I' | 'L' | 'R';
  firstAvailableSerialNumber: number;
  lastAvailableSerialNumber: number;
  yearCode: number;
  user: UserType | null;
} & TimeStamps;
