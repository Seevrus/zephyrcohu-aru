/* eslint-disable sonarjs/no-duplicate-string */
import {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useNetInfo } from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAtom, useAtomValue } from 'jotai';
import { isNotNil } from 'ramda';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { queryKeys } from '../../api/keys';
import { useStartRound } from '../../api/mutations/useStartRound';
import { fetchItems } from '../../api/queries/useItems';
import { fetchOtherItems } from '../../api/queries/useOtherItems';
import {
  fetchPartnerLists,
  usePartnerLists,
} from '../../api/queries/usePartnerLists';
import { fetchPartners } from '../../api/queries/usePartners';
import { fetchPriceLists } from '../../api/queries/usePriceLists';
import { fetchStoreDetails } from '../../api/queries/useStoreDetails';
import { fetchStores, useStores } from '../../api/queries/useStores';
import { selectedStoreCurrentStateAtom } from '../../atoms/storage';
import { tokenAtom } from '../../atoms/token';
import { Container } from '../../components/container/Container';
import { ErrorCard } from '../../components/info-cards/ErrorCard';
import { Loading } from '../../components/Loading';
import { Button } from '../../components/ui/Button';
import { Dropdown } from '../../components/ui/Dropdown';
import { Input } from '../../components/ui/Input';
import { type StartErrandProps } from '../../navigators/screen-types';

function SuspendedStartErrand({ navigation }: StartErrandProps) {
  const { isInternetReachable } = useNetInfo();
  const {
    data: partnerLists,
    isFetching: isPartnersListsFetching,
    isPending: isPartnerListsPending,
  } = usePartnerLists();
  const queryClient = useQueryClient();
  const { mutateAsync: startRound, isPending: isStartRoundPending } =
    useStartRound();
  const {
    data: stores,
    isFetching: isStoresFetching,
    isPending: isStoresPending,
  } = useStores();

  const { token, isPasswordExpired, isTokenExpired } = useAtomValue(tokenAtom);
  const [, setSelectedStoreCurrentState] = useAtom(
    selectedStoreCurrentStateAtom
  );

  const [storeId, setStoreId] = useState<number | null>(null);
  const [partnerListId, setPartnerListId] = useState<number | null>(null);
  const [date, setDate] = useState<Date>(new Date());

  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isInternetReachable === false || isTokenExpired || isPasswordExpired) {
      navigation.pop();
    }
  }, [isInternetReachable, isPasswordExpired, isTokenExpired, navigation]);

  const confirmRoundHandler = async () => {
    if (isNotNil(storeId) && isNotNil(partnerListId) && token) {
      setLoadingMessage('Körindítás folyamatban...');

      try {
        await startRound({
          storeId,
          partnerListId,
          roundStarted: format(date, 'yyyy-MM-dd'),
        });

        await queryClient.invalidateQueries({
          queryKey: queryKeys.checkToken,
          refetchType: 'all',
        });
        await queryClient.invalidateQueries({ queryKey: queryKeys.items });
        await queryClient.invalidateQueries({ queryKey: queryKeys.otherItems });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.partnerLists,
        });
        await queryClient.invalidateQueries({ queryKey: queryKeys.partners });
        await queryClient.invalidateQueries({ queryKey: queryKeys.priceLists });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.searchTaxNumber(),
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.storeDetails(),
        });
        await queryClient.invalidateQueries({ queryKey: queryKeys.stores });

        await queryClient.fetchQuery({
          queryKey: queryKeys.items,
          queryFn: fetchItems(token),
        });
        await queryClient.fetchQuery({
          queryKey: queryKeys.otherItems,
          queryFn: fetchOtherItems(token),
        });
        await queryClient.fetchQuery({
          queryKey: queryKeys.partnerLists,
          queryFn: fetchPartnerLists(token),
        });
        await queryClient.fetchQuery({
          queryKey: queryKeys.partners,
          queryFn: fetchPartners(token),
        });
        await queryClient.fetchQuery({
          queryKey: queryKeys.priceLists,
          queryFn: fetchPriceLists(token),
        });

        const storeDetails = await queryClient.fetchQuery({
          queryKey: queryKeys.storeDetails(storeId),
          queryFn: fetchStoreDetails(token, storeId),
        });
        await setSelectedStoreCurrentState(storeDetails);

        await queryClient.fetchQuery({
          queryKey: queryKeys.stores,
          queryFn: fetchStores(token),
        });

        navigation.reset({
          index: 0,
          routes: [{ name: 'Index' }],
        });
      } catch (error) {
        setLoadingMessage('');
        setError(error.message);
      }
    }
  };

  const refreshHandler = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.partnerLists });
    queryClient.invalidateQueries({ queryKey: queryKeys.stores });
  }, [queryClient]);

  const displayStores = useMemo(
    () =>
      (stores ?? [])
        .filter((store) => store.type !== 'P' && store.state === 'I')
        .map((store) => ({
          key: String(store.id),
          value: store.name,
        }))
        .sort((storeA, storeB) =>
          storeA.value.localeCompare(storeB.value, 'HU-hu')
        ),
    [stores]
  );

  const selectStoreHandler = useCallback((key: string) => {
    setStoreId(+key);
  }, []);

  const displayPartnerLists = useMemo(
    () =>
      (partnerLists ?? []).map((partnerList) => ({
        key: String(partnerList.id),
        value: partnerList.name,
      })),
    [partnerLists]
  );

  const selectPartnerListHandler = useCallback((key: string) => {
    setPartnerListId(+key);
  }, []);

  const selectDateHandler = useCallback(
    (_: DateTimePickerEvent, selectedDate: Date | undefined) => {
      setDate(selectedDate ?? new Date());
    },
    []
  );

  const showDatePicker = useCallback(() => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: selectDateHandler,
      mode: 'date',
      is24Hour: true,
      minimumDate: new Date(),
    });
  }, [date, selectDateHandler]);

  const confirmButtonVariant =
    isNotNil(storeId) && isNotNil(partnerListId) && !!token ? 'ok' : 'disabled';

  if (
    isPartnersListsFetching ||
    isPartnerListsPending ||
    isStartRoundPending ||
    isStoresFetching ||
    isStoresPending ||
    !!loadingMessage
  ) {
    return <Loading message={loadingMessage} />;
  }

  return (
    <Container>
      {!!error && (
        <View style={styles.error}>
          <ErrorCard>{error}</ErrorCard>
        </View>
      )}
      <View style={styles.inputContainer}>
        <Dropdown
          label="Raktár"
          data={displayStores}
          onSelect={selectStoreHandler}
        />
      </View>
      <View style={styles.inputContainer}>
        <Dropdown
          label="Partnerlista"
          data={displayPartnerLists}
          onSelect={selectPartnerListHandler}
        />
      </View>
      <View style={styles.dateContainer}>
        <Pressable onPress={showDatePicker} style={styles.dateInnerContainer}>
          <Input
            label="Dátum"
            variant="input"
            config={{ editable: false, value: format(date, 'yyyy-MM-dd') }}
          />
        </Pressable>
      </View>
      <View style={styles.buttonContainer}>
        <Button variant={confirmButtonVariant} onPress={confirmRoundHandler}>
          Kör indítása
        </Button>
        <Button variant="warning" onPress={refreshHandler}>
          Adatok frissítése
        </Button>
      </View>
    </Container>
  );
}

export function StartErrand(props: StartErrandProps) {
  return (
    <Suspense fallback={<Container />}>
      <SuspendedStartErrand {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    height: 150,
    justifyContent: 'space-between',
    marginTop: 30,
  },
  dateContainer: {
    marginHorizontal: '7%',
    marginTop: 20,
  },
  dateInnerContainer: {
    height: 90,
  },
  error: {
    marginTop: 30,
  },
  inputContainer: {
    marginTop: 20,
  },
});
