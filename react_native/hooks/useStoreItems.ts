import { useCallback } from 'react';

import { RootState } from '../store';
import { useAppSelector } from '../store/hooks';

const useStoreItems = () => {
  const selectStoreItems = useCallback((state: RootState) => state.stores.store.items, []);
  return useAppSelector(selectStoreItems);
};

export default useStoreItems;
