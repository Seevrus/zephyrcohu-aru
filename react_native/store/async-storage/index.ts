import AsyncStorage from '@react-native-async-storage/async-storage';
import { mergeDeepRight } from 'ramda';

import userTypes from '../../constants/userTypes';

type LocalStorageT = {
  config?: {
    isDemoMode?: boolean;
    isLoggedin?: boolean;
    userType?: (typeof userTypes)[keyof typeof userTypes];
  };
};

export const getLocalStorage = async () => {
  try {
    const jsonStore = await AsyncStorage.getItem('boreal-store');
    const importedStore: LocalStorageT = jsonStore ? JSON.parse(jsonStore) : {};
    return importedStore;
  } catch (_) {
    throw new Error('Probléma lépett fel az alkalmazás mentett állapotának helyreállítása során.');
  }
};

export const setLocalStorage = async (items: LocalStorageT) => {
  try {
    const jsonStore = await AsyncStorage.getItem('boreal-store');
    const importedStore: LocalStorageT = jsonStore ? JSON.parse(jsonStore) : {};

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
