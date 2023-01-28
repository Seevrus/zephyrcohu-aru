import { useEffect, useState } from 'react';

import { getLocalStorage } from '../store/async-storage';
import { clientsActions } from '../store/clients-slice/clients-slice';
import { companyActions } from '../store/company-slice/company-slice';
import { configActions } from '../store/config-slice/config-slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { productsActions } from '../store/products-slice/products-slice';
import { roundActions } from '../store/round-slice/round-slice';
import { roundsActions } from '../store/rounds-slice/rounds-slice';

const useLocalState = () => {
  const dispatch = useAppDispatch();
  const [localStateError, setLocalStateError] = useState<string>('');
  const isLocalStateMerged = useAppSelector((state) => state.config.isLocalStateMerged);

  useEffect(() => {
    console.log('Fetching local state');
    const resetStateFromLocal = async () => {
      if (isLocalStateMerged) return;

      let error: string;
      try {
        const importedStore = await getLocalStorage();

        dispatch(configActions.mergeLocalState(importedStore.config));
        dispatch(companyActions.mergeLocalState(importedStore.company));
        dispatch(clientsActions.mergeLocalState(importedStore.clients));
        dispatch(roundsActions.mergeLocalState(importedStore.rounds));
        dispatch(productsActions.mergeLocalState(importedStore.products));
        dispatch(roundActions.mergeLocalState(importedStore.round));
      } catch (err) {
        error = 'Probléma lépett fel az alkalmazás mentett állapotának helyreállítása során.';
      }

      setLocalStateError(error);
    };

    resetStateFromLocal();
  }, [dispatch, isLocalStateMerged]);

  return [localStateError];
};

export default useLocalState;
