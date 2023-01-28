import { useEffect, useState } from 'react';

import { getLocalStorage } from '../store/async-storage';
import { configActions } from '../store/config-slice/config-slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const useLocalState = () => {
  const dispatch = useAppDispatch();
  const [localStoreError, setLocalStoreError] = useState<string>('');
  const isLocalStateMerged = useAppSelector((state) => state.config.isLocalStateMerged);

  useEffect(() => {
    const resetStateFromLocal = async () => {
      if (isLocalStateMerged) return;

      let error: string;
      try {
        const importedStore = await getLocalStorage();

        dispatch(
          configActions.mergeLocalState({
            isDemoMode: importedStore.config?.isDemoMode ?? false,
            isLoggedin: importedStore.config?.isLoggedin ?? false,
            userType: importedStore.config?.userType,
          })
        );
      } catch (_) {
        error = 'Probléma lépett fel az alkalmazás mentett állapotának helyreállítása során.';
      }

      setLocalStoreError(error);
    };

    resetStateFromLocal();
  }, [dispatch, isLocalStateMerged]);

  return [localStoreError];
};

export default useLocalState;
