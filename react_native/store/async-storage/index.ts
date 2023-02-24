import AsyncStorage from '@react-native-async-storage/async-storage';
import { mergeRight } from 'ramda';

import { Agents } from '../agents-slice/agents-slice-types';
import { Config } from '../config-slice/config-slice-types';
import { Items } from '../items-slice/items-slice-types';
import { PartnerDetails, PartnerList } from '../partners-slice/partners-slice-types';
import { Round } from '../round-slice/round-slice-types';
import { Store, StoreDetails } from '../stores-slice/stores-slice-types';

export type LocalStorage = {
  config?: Config;
  agents?: Agents;
  partnerLists?: PartnerList[];
  partners?: PartnerDetails[];
  items?: Items;
  storeList?: Store[];
  store?: StoreDetails;
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

export const setLocalStorage = async (items: Partial<LocalStorage>) => {
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
