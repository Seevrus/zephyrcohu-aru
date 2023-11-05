import { useAtom } from 'jotai';
import { useCallback } from 'react';

import { isStorageSavedToApiAtom, storageListItemsAtom } from './storageFlow';

export function useResetStorageFlow() {
  const [, setIsStorageSavedToApi] = useAtom(isStorageSavedToApiAtom);
  const [, setStorageListItems] = useAtom(storageListItemsAtom);

  return useCallback(() => {
    setIsStorageSavedToApi(false);
    setStorageListItems(null);
  }, [setIsStorageSavedToApi, setStorageListItems]);
}
