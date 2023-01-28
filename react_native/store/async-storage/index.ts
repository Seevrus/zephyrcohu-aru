import AsyncStorage from '@react-native-async-storage/async-storage';
import { mergeDeepRight } from 'ramda';

import userTypes from '../../constants/userTypes';

export type LocalStorage = {
  config?: {
    isDemoMode: boolean;
    isLoggedin: boolean;
    userType: (typeof userTypes)[keyof typeof userTypes];
  };
  company?: {
    name: string;
    vatNumber: string;
    address: {
      zipCode: number;
      city: string;
      address: string;
    };
  };
  clients?: {
    name: string;
    vatNumber: string;
    address: {
      zipCode: number;
      city: string;
      address: string;
    };
  }[];
  products?: {
    id: number;
    name: string;
    price: number;
    expirations: {
      expiresAt: string;
      quantity: number;
    }[];
  }[];
  rounds?: {
    id: number;
    name: string;
    clientIds: number[];
    firstAvailableReceiptNr: string;
  }[];
  round?: {
    id: number;
    name: string;
    clientIds: number[];
    firstAvailableReceiptNr: string;
    receipts?: {
      clientId: number;
      receiptNr: string;
      transactions: {
        productId: string;
        purchases?: {
          expiresAt: string;
          quantity: number;
          itemAmount: number;
        }[];
        order?: {
          quantity: number;
          itemAmount: number;
        };
      }[];
      totalAmount: number;
      createdAt: string;
    }[];
  };
};

export const getLocalStorage = async () => {
  try {
    const jsonStore = await AsyncStorage.getItem('boreal-store');
    const importedStore: LocalStorage = jsonStore ? JSON.parse(jsonStore) : {};
    return importedStore;
  } catch (_) {
    throw new Error('Probléma lépett fel az alkalmazás mentett állapotának helyreállítása során.');
  }
};

export const setLocalStorage = async (items: LocalStorage) => {
  try {
    const jsonStore = await AsyncStorage.getItem('boreal-store');
    const importedStore: LocalStorage = jsonStore ? JSON.parse(jsonStore) : {};

    const newState = mergeDeepRight(importedStore, items);
    await AsyncStorage.setItem('boreal-store', JSON.stringify(newState));
  } catch (_) {
    throw new Error('Probléma lépett fel az alkalmazás állapotának eltárolása során.');
  }
};

export const removeLocalStorage = async () => {
  try {
    await AsyncStorage.removeItem('boreal-store');
  } catch (_) {
    throw new Error('Probléma lépett fel az alkalmazás állapotának eltárolása során.');
  }
};
