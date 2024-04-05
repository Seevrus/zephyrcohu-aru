import { useAtom } from 'jotai';
import { useCallback } from 'react';

import {
  primaryStoreAtom,
  selectedStoreCurrentStateAtom,
  selectedStoreInitialStateAtom,
} from './storage';

export function useResetStorage() {
  const [, setPrimaryStore] = useAtom(primaryStoreAtom);
  const [, setSelectedStoreInitialState] = useAtom(
    selectedStoreInitialStateAtom
  );
  const [, setSelectedStoreCurrentState] = useAtom(
    selectedStoreCurrentStateAtom
  );

  return useCallback(
    () =>
      Promise.all([
        setPrimaryStore(null),
        setSelectedStoreInitialState(null),
        setSelectedStoreCurrentState(null),
      ]),
    [
      setPrimaryStore,
      setSelectedStoreCurrentState,
      setSelectedStoreInitialState,
    ]
  );
}
