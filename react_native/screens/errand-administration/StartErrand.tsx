import {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useNetInfo } from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useStartRound } from '../../api/mutations/useStartRound';
import { fetchActiveRound } from '../../api/queries/activeRoundAtom';
import { fetchItems } from '../../api/queries/itemsAtom';
import { fetchOtherItems } from '../../api/queries/useOtherItems';
import {
  fetchPartnerLists,
  usePartnerLists,
} from '../../api/queries/partnerListstAtom';
import { fetchPartners } from '../../api/queries/usePartners';
import { fetchPriceLists } from '../../api/queries/usePriceLists';
import { fetchStoreDetails } from '../../api/queries/storeDetailsAtom';
import { fetchStores, useStores } from '../../api/queries/storesAtom';
import { useToken } from '../../api/queries/tokenAtom';
import { Loading } from '../../components/Loading';
import { ErrorCard } from '../../components/info-cards/ErrorCard';
import { Button } from '../../components/ui/Button';
import { Dropdown } from '../../components/ui/Dropdown';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { type StartErrandProps } from '../../navigators/screen-types';

export function StartErrand({ navigation }: StartErrandProps) {
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
  const { data: { token } = {} } = useToken();

  const [storeId, setStoreId] = useState<number>(-1);
  const [partnerListId, setPartnerListId] = useState<number>(-1);
  const [date, setDate] = useState<Date>(new Date());

  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isInternetReachable === false) {
      navigation.pop();
    }
  }, [isInternetReachable, navigation]);

  const confirmRoundHandler = async () => {
    setLoadingMessage('Körindítás folyamatban...');

    try {
      await startRound({
        storeId,
        partnerListId,
        roundStarted: format(date, 'yyyy-MM-dd'),
      });

      await queryClient.fetchQuery({
        queryKey: ['active-round', token],
        queryFn: () => fetchActiveRound(token),
      });
      await queryClient.invalidateQueries({
        queryKey: ['check-token', token],
        refetchType: 'all',
      });
      await queryClient.fetchQuery({
        queryKey: ['items', token],
        queryFn: () => fetchItems(token),
      });
      await queryClient.fetchQuery({
        queryKey: ['other-items', token],
        queryFn: () => fetchOtherItems(token),
      });
      await queryClient.fetchQuery({
        queryKey: ['partner-lists', token],
        queryFn: () => fetchPartnerLists(token),
      });
      await queryClient.fetchQuery({
        queryKey: ['partners', token],
        queryFn: () => fetchPartners(token),
      });
      await queryClient.fetchQuery({
        queryKey: ['price-lists', token],
        queryFn: () => fetchPriceLists(token),
      });
      await queryClient.fetchQuery({
        queryKey: ['store-details', storeId, token],
        queryFn: () => fetchStoreDetails(token, storeId),
      });
      await queryClient.fetchQuery({
        queryKey: ['stores', token],
        queryFn: () => fetchStores(token),
      });

      navigation.pop();
    } catch (error_) {
      setLoadingMessage('');
      setError(error_.message);
    }
  };

  const refreshHandler = () => {
    queryClient.invalidateQueries({ queryKey: ['partner-lists'] });
    queryClient.invalidateQueries({ queryKey: ['stores'] });
  };

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

  const displayStores = (stores ?? [])
    .filter((store) => store.type !== 'P' && store.state === 'I')
    .map((store) => ({
      key: String(store.id),
      value: store.name,
    }));

  const selectStoreHandler = (key: string) => {
    setStoreId(+key);
  };

  const displayPartners = (partnerLists ?? []).map((partnerList) => ({
    key: String(partnerList.id),
    value: partnerList.name,
  }));

  const selectPartnerListHandler = (key: string) => {
    setPartnerListId(+key);
  };

  const selectDateHandler = (_: DateTimePickerEvent, selectedDate: Date) => {
    setDate(selectedDate);
  };

  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: selectDateHandler,
      mode: 'date',
      is24Hour: true,
      minimumDate: new Date(),
    });
  };

  const confirmButtonVariant =
    storeId > -1 && partnerListId > -1 ? 'ok' : 'disabled';

  return (
    <View style={styles.container}>
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
          data={displayPartners}
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
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    height: 150,
    justifyContent: 'space-between',
    marginTop: 30,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
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
