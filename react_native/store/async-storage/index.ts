import AsyncStorage from '@react-native-async-storage/async-storage';
import { mergeRight } from 'ramda';

import { Agents } from '../agents-slice/agents-slice-types';
import { Config } from '../config-slice/config-slice-types';
import { Items } from '../items-slice/items-slice-types';
import { PartnersSlice } from '../partners-slice/partners-slice-types';
import { Round } from '../round-slice/round-slice-types';
import { StoreList } from '../store-list-slice/store-list-slice-types';
import { Store } from '../store-slice/store-slice-types';

export type LocalStorage = {
  config?: Config;
  agents?: Agents;
  partners?: PartnersSlice;
  items?: Items;
  storeList?: StoreList;
  store?: Store;
  round?: Round;
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

export const setLocalStorage = async (items) => {
  try {
    const jsonStore = await AsyncStorage.getItem('boreal-store');
    const importedStore: LocalStorage = jsonStore ? JSON.parse(jsonStore) : {};

    const newState = mergeRight(importedStore, items);
    await AsyncStorage.setItem('boreal-store', JSON.stringify(newState));
  } catch (_) {
    throw new Error('Probléma lépett fel az alkalmazás állapotának eltárolása során.');
  }
};

export const removeLocalStorage = async () => {
  try {
    await AsyncStorage.removeItem('boreal-store');
  } catch (_) {
    throw new Error('Probléma lépett fel az alkalmazás adatainak törlése során.');
  }
};
