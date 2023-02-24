import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useNetInfo } from '@react-native-community/netinfo';
import { format } from 'date-fns';
import { any, find, isNil, pipe, prop, propEq } from 'ramda';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import useToken from '../../hooks/useToken';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPartnerList, fetchPartners } from '../../store/partners-slice/partners-api-actions';
import { fetchStore, fetchStoreList } from '../../store/stores-slice/stores-api-actions';

import ErrorCard from '../../components/info-cards/ErrorCard';
import Loading from '../../components/Loading';
import Button from '../../components/ui/buttons/Button';
import Dropdown from '../../components/ui/Dropdown';
import Input from '../../components/ui/Input';
import colors from '../../constants/colors';
import { fetchAgents } from '../../store/agents-slice/agents-api-actions';
import { fetchItems } from '../../store/items-slice/items-api-actions';
import { initializeRound } from '../../store/round-slice/round-api-actions';
import { StartErrandProps } from '../screen-types';

export default function StartErrand({ navigation }: StartErrandProps) {
  const dispatch = useAppDispatch();
  const { isInternetReachable } = useNetInfo();
  const { deviceId, token, credentialsAvailable, tokenStorageError } = useToken();

  const agents = useAppSelector((state) => state.agents.data);
  const currentAgentId = useAppSelector((state) => state.round.agentId);
  const [agentId, setAgentId] = useState<number>(currentAgentId ?? -1);

  const storeList = useAppSelector((state) => state.stores.storeList);
  const currentStoreId = useAppSelector((state) => state.round.storeId);
  const [storeId, setStoreId] = useState<number>(currentStoreId ?? -1);

  const partnerLists = useAppSelector((state) => state.partners.partnerLists);
  const currentPartnerListId = useAppSelector((state) => state.round.partnerListId);
  const [partnerListId, setPartnerListId] = useState<number>(currentPartnerListId ?? -1);

  const currentDate = useAppSelector((state) => state.round.date);
  const [date, setDate] = useState<Date>(new Date(currentDate ?? Date.now()));

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [roundDataError, setRoundDataError] = useState<string>('');
  const [confirmRoundError, setConfirmRoundError] = useState<string>('');

  useEffect(() => {
    if (isInternetReachable === false || tokenStorageError) {
      navigation.pop();
    }
  }, [isInternetReachable, navigation, tokenStorageError]);

  useEffect(() => {
    if (credentialsAvailable && !roundDataError && any(isNil, [agents, storeList, partnerLists])) {
      setLoading(true);
      setLoadingMessage('Körök adatainak betöltése...');
      Promise.all([
        dispatch(fetchAgents({ deviceId, token })),
        dispatch(fetchStoreList({ deviceId, token })),
        dispatch(fetchPartnerList({ deviceId, token })),
      ])
        .then(() => {
          setRoundDataError('');
        })
        .catch((err) => {
          setRoundDataError(err.message);
        })
        .finally(() => {
          setLoading(false);
          setLoadingMessage('');
        });
    }
  }, [
    agents,
    credentialsAvailable,
    deviceId,
    dispatch,
    partnerLists,
    roundDataError,
    storeList,
    token,
  ]);

  const confirmRoundHandler = async () => {
    setLoading(true);
    setLoadingMessage('Körindításhoz szükséges adatok letöltése folyamatban...');

    const selectedStoreCode: string = pipe(find(propEq('id', storeId)), prop('code'))(storeList);

    Promise.all([
      dispatch(fetchItems({ deviceId, token })),
      dispatch(fetchPartners({ deviceId, token })),
      dispatch(fetchStore({ deviceId, token, code: selectedStoreCode })).unwrap(),
    ])
      .then(([, , fetchedStore]) => {
        dispatch(
          initializeRound({
            agentId,
            storeId,
            partnerListId,
            date: format(date, 'yyyy-MM-dd'),
            nextAvailableSerialNumber: fetchedStore.firstAvailableSerialNumber,
          })
        ).then(() => {
          navigation.pop();
        });
      })
      .catch((err) => {
        setConfirmRoundError(err.message);
      });
  };

  if (loading) {
    return <Loading message={loadingMessage} />;
  }

  const mapItemToOption = (item) => ({
    key: String(item.id),
    value: item.name,
  });

  const displayNames = (agents ?? []).map(mapItemToOption);
  const defaultName = displayNames.find((option) => +option.key === currentAgentId);

  const selectAgentHandler = (key: string) => {
    setAgentId(+key);
  };

  const displayStores = (storeList ?? []).map((store) => ({
    key: String(store.id),
    value: store.name,
  }));
  const defaultStore = displayStores.find((option) => +option.key === currentStoreId);

  const selectStoreHandler = (key: string) => {
    setStoreId(+key);
  };

  const displayPartners = (partnerLists ?? []).map((partnerList) => ({
    key: String(partnerList.id),
    value: partnerList.name,
  }));
  const defaultPartners = displayPartners.find((option) => +option.key === currentPartnerListId);

  const selectPartnerListHandler = (key: string) => {
    setPartnerListId(+key);
  };

  const selectDateHandler = (_, selectedDate: Date) => {
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

  const confirmButtonvariant =
    agentId > -1 && storeId > -1 && partnerListId > -1 ? 'ok' : 'disabled';

  return (
    <View style={styles.container}>
      {!!roundDataError && (
        <View style={styles.error}>
          <ErrorCard>{roundDataError}</ErrorCard>
        </View>
      )}
      {!!confirmRoundError && (
        <View style={styles.error}>
          <ErrorCard>{confirmRoundError}</ErrorCard>
        </View>
      )}
      <View style={styles.inputContainer}>
        <Dropdown
          label="Felhasználó"
          data={displayNames}
          defaultOption={defaultName}
          onSelect={selectAgentHandler}
        />
      </View>
      <View style={styles.inputContainer}>
        <Dropdown
          label="Raktár"
          data={displayStores}
          defaultOption={defaultStore}
          onSelect={selectStoreHandler}
        />
      </View>
      <View style={styles.inputContainer}>
        <Dropdown
          label="Partnerlista"
          data={displayPartners}
          defaultOption={defaultPartners}
          onSelect={selectPartnerListHandler}
        />
      </View>
      <View style={styles.dateContainer}>
        <Pressable onPress={showDatePicker} style={styles.dateInnerContainer}>
          <Input label="Dátum" config={{ editable: false, value: format(date, 'yyyy-MM-dd') }} />
        </Pressable>
      </View>
      <View style={styles.buttonContainer}>
        <Button variant={confirmButtonvariant} onPress={confirmRoundHandler}>
          Kör indítása
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
