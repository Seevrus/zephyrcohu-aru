import { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNetInfo } from '@react-native-community/netinfo';
import {
  EventListenerCallback,
  EventMapCore,
  StackNavigationState,
} from '@react-navigation/native';
import { NativeStackNavigationEventMap } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import useStartRound from '../../api/mutations/useStartRound';
import useActiveRound from '../../api/queries/useActiveRound';
import useItems from '../../api/queries/useItems';
import useOtherItems from '../../api/queries/useOtherItems';
import usePartnerLists from '../../api/queries/usePartnerLists';
import usePartners from '../../api/queries/usePartners';
import usePriceLists from '../../api/queries/usePriceLists';
import useStores from '../../api/queries/useStores';
import Loading from '../../components/Loading';
import ErrorCard from '../../components/info-cards/ErrorCard';
import Button from '../../components/ui/Button';
import Dropdown from '../../components/ui/Dropdown';
import Input from '../../components/ui/Input';
import colors from '../../constants/colors';
import { StackParams, StartErrandProps } from '../../navigators/screen-types';

export default function StartErrand({ navigation }: StartErrandProps) {
  const { isFetched: isActiveRoundFetched, isFetching: isActiveRoundFetching } = useActiveRound();
  const { isFetched: isItemsFetched, isFetching: isItemsFetching } = useItems();
  const { isInternetReachable } = useNetInfo();
  const { isFetched: isOtherItemsFetched, isFetching: isOtherItemsFetching } = useOtherItems();
  const { isFetched: isPartnersFetched, isFetching: isPartnersFetching } = usePartners();
  const {
    data: partnerLists,
    isFetching: isPartnersListsFetching,
    isPending: isPartnerListsPending,
  } = usePartnerLists();
  const { isFetched: isPriceListsFetched, isFetching: isPriceListsFetching } = usePriceLists();
  const queryClient = useQueryClient();
  const {
    mutateAsync: startRound,
    isPending: isStartRoundPending,
    isSuccess: isStartRoundSuccess,
  } = useStartRound();
  const { data: stores, isFetching: isStoresFetching, isPending: isStoresPending } = useStores();

  const [storeId, setStoreId] = useState<number>(-1);
  const [partnerListId, setPartnerListId] = useState<number>(-1);
  const [date, setDate] = useState<Date>(new Date());

  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const preventGoBackWhileLoading: EventListenerCallback<
      NativeStackNavigationEventMap & EventMapCore<StackNavigationState<StackParams>>,
      'beforeRemove'
    > = (event) => {
      if (
        isStartRoundPending ||
        isActiveRoundFetching ||
        isItemsFetching ||
        isOtherItemsFetching ||
        isPartnersFetching ||
        isPriceListsFetching
      ) {
        event.preventDefault();
      }
    };

    navigation.addListener('beforeRemove', preventGoBackWhileLoading);
    return () => navigation.removeListener('beforeRemove', preventGoBackWhileLoading);
  }, [
    isActiveRoundFetching,
    isItemsFetching,
    isOtherItemsFetching,
    isPartnersFetching,
    isPriceListsFetching,
    isStartRoundPending,
    navigation,
  ]);

  useEffect(() => {
    if (isInternetReachable === false) {
      navigation.pop();
    }
  }, [isInternetReachable, navigation]);

  useEffect(() => {
    if (
      isStartRoundSuccess &&
      isActiveRoundFetched &&
      isItemsFetched &&
      isOtherItemsFetched &&
      isPartnersFetched &&
      isPriceListsFetched
    ) {
      navigation.pop();
    }
  }, [
    isActiveRoundFetched,
    isItemsFetched,
    isOtherItemsFetched,
    isPartnersFetched,
    isPriceListsFetched,
    isStartRoundSuccess,
    navigation,
  ]);

  const confirmRoundHandler = async () => {
    setLoadingMessage('Körindítás folyamatban...');

    try {
      await startRound({
        storeId,
        partnerListId,
      });
    } catch (err) {
      setLoadingMessage('');
      setError(err.message);
    }
  };

  const refreshHandler = () => {
    queryClient.invalidateQueries({ queryKey: ['partner-lists'] });
    queryClient.invalidateQueries({ queryKey: ['stores'] });
  };

  if (
    isActiveRoundFetching ||
    isItemsFetching ||
    isOtherItemsFetching ||
    isPartnersFetching ||
    isPartnersListsFetching ||
    isPartnerListsPending ||
    isPriceListsFetching ||
    isStartRoundPending ||
    isStoresFetching ||
    isStoresPending
  ) {
    return <Loading message={loadingMessage} />;
  }

  const displayStores = (stores ?? [])
    .filter((store) => store.type !== 'P')
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

  const confirmButtonVariant = storeId > -1 && partnerListId > -1 ? 'ok' : 'disabled';

  return (
    <View style={styles.container}>
      {!!error && (
        <View style={styles.error}>
          <ErrorCard>{error}</ErrorCard>
        </View>
      )}
      <View style={styles.inputContainer}>
        <Dropdown label="Raktár" data={displayStores} onSelect={selectStoreHandler} />
      </View>
      <View style={styles.inputContainer}>
        <Dropdown label="Partnerlista" data={displayPartners} onSelect={selectPartnerListHandler} />
      </View>
      <View style={styles.dateContainer}>
        <Pressable onPress={showDatePicker} style={styles.dateInnerContainer}>
          <Input label="Dátum" config={{ editable: false, value: format(date, 'yyyy-MM-dd') }} />
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  error: {
    marginTop: 30,
  },
  inputContainer: {
    marginTop: 20,
  },
  dateContainer: {
    marginTop: 20,
    marginHorizontal: '7%',
  },
  dateInnerContainer: {
    height: 90,
  },
  buttonContainer: {
    marginTop: 30,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
