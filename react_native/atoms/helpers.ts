import AsyncStorage from '@react-native-async-storage/async-storage';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

export const atomWithAsyncStorage = <T>(key: string, content: T) => {
  const storage = createJSONStorage<T>(() => AsyncStorage);
  return atomWithStorage<T>(key, content, storage);
};
