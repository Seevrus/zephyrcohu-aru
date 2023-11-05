import { useAtom } from 'jotai';
import { useCallback } from 'react';

import {
  primaryStoreAtom,
  selectedStoreAtom,
  selectedStoreInitialStateAtom,
} from './storage';

export function useResetStorage() {
  const [, setPrimaryStore] = useAtom(primaryStoreAtom);
  const [, setSelectedStoreInitialState] = useAtom(
    selectedStoreInitialStateAtom
  );
  const [, setSelectedStore] = useAtom(selectedStoreAtom);

  return useCallback(
    () =>
      Promise.all([
        setPrimaryStore(null),
        setSelectedStoreInitialState(null),
        setSelectedStore(null),
      ]),
    [setPrimaryStore, setSelectedStore, setSelectedStoreInitialState]
  );
}
