import { UserType } from './UserType';

export type StoreType = {
  id: number;
  code: string;
  name: string;
  type: 'P' | 'S';
  firstAvailableSerialNumber: number;
  lastAvailableSerialNumber: number;
  yearCode: number;
  user: UserType;
  createdAt: string; // UTC
  updatedAt: string; // UTC
};