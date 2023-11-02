import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* export const atomWithAsyncStorage = <T>(key: string, initialValue: T) => {
  const baseAtom = atom(initialValue);
  baseAtom.onMount = (setValue) => {
    (async () => {
      const jsonItem = await AsyncStorage.getItem(key);

      if (jsonItem) {
        setValue(JSON.parse(jsonItem));
      }
    })();
  };
  return atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue =
        typeof update === 'function' ? update(get(baseAtom)) : update;
      set(baseAtom, nextValue);
      AsyncStorage.setItem(key, JSON.stringify(nextValue));
    }
  );
}; */

export const atomWithAsyncStorage = <T>(key: string, content: T) => {
  const storage = createJSONStorage<T>(() => AsyncStorage);
  return atomWithStorage<T>(key, content, storage);
};
