import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

export const atomWithAsyncStorage = <T>(key: string, content: T) => {
  const storage = createJSONStorage<T>(() => AsyncStorage);
  return atomWithStorage<T>(key, content, storage);
};

const SecureStorage = <const>{
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export const atomWithSecureStorage = <T>(key: string, content: T) => {
  const storage = createJSONStorage<T>(() => SecureStorage);
  return atomWithStorage<T>(key, content, storage);
};
