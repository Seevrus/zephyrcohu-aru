import { useEffect, useState } from 'react';

import { getLocalStorage } from '../store/async-storage';
import { clientsActions } from '../store/clients-slice/clients-slice';
import { companyActions } from '../store/company-slice/company-slice';
import { configActions } from '../store/config-slice/config-slice';
import { useAppDispatch } from '../store/hooks';
import { productsActions } from '../store/products-slice/products-slice';
import { roundActions } from '../store/round-slice/round-slice';
import { roundsActions } from '../store/rounds-slice/rounds-slice';

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
        dispatch(companyActions.mergeLocalState(importedStore.company));
        dispatch(clientsActions.mergeLocalState(importedStore.clients));
        dispatch(roundsActions.mergeLocalState(importedStore.rounds));
        dispatch(productsActions.mergeLocalState(importedStore.products));
        dispatch(roundActions.mergeLocalState(importedStore.round));

        setIsLocalStateMerged(true);
      } catch (_) {
        setLocalStateError(true);
      }
    };

    resetStateFromLocal();
  }, [canGetLocalState, dispatch]);

  return [isLocalStateMerged, localStateError];
};

export default useLocalStorage;
