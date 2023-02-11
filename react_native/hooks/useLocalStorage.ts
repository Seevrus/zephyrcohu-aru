import { useEffect, useState } from 'react';

import { getLocalStorage } from '../store/async-storage';
import { configActions } from '../store/config-slice/config-slice';
import { useAppDispatch } from '../store/hooks';
import { itemsActions } from '../store/items-slice/items-slice';
import { partnersActions } from '../store/partners-slice/partners-slice';
import { roundActions } from '../store/round-slice/round-slice';
import { storeListActions } from '../store/store-list-slice/store-list-slice';
import { storeActions } from '../store/store-slice/store-slice';

const useLocalStorage = (canGetLocalState: boolean) => {
  const dispatch = useAppDispatch();
  const [isLocalStateMerged, setIsLocalStateMerged] = useState<boolean>(false);
  const [localStateError, setLocalStateError] = useState<boolean>(false);

  useEffect(() => {
    const resetStateFromLocal = async () => {
      if (!canGetLocalState) return;

      try {
        const importedStore = await getLocalStorage();

        dispatch(configActions.mergeLocalState(importedStore.config));
        dispatch(partnersActions.mergeLocalState(importedStore.partners));
        dispatch(itemsActions.mergeLocalState(importedStore.items));
        dispatch(storeActions.mergeLocalState(importedStore.store));
        dispatch(storeListActions.mergeLocalState(importedStore.storeList));
        dispatch(roundActions.mergeLocalState(importedStore.round));

        setIsLocalStateMerged(true);
      } catch (e) {
        setLocalStateError(true);
      }
    };

    resetStateFromLocal();
  }, [canGetLocalState, dispatch]);

  return [isLocalStateMerged, localStateError];
};

export default useLocalStorage;
