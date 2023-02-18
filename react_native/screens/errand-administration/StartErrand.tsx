import { useNetInfo } from '@react-native-community/netinfo';
import { find, pipe, prop, propEq, sortBy } from 'ramda';
import { useEffect, useState } from 'react';
import {
  Animated,
  ListRenderItem,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { SelectList } from 'react-native-dropdown-select-list';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import useToken from '../../hooks/useToken';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchItems } from '../../store/items-slice/items-api-actions';
import { fetchPartners } from '../../store/partners-slice/partners-api-actions';
import { initializeRound } from '../../store/round-slice/round-api-actions';
import { fetchStores } from '../../store/store-list-slice/store-list-api-actions';
import { fetchStore } from '../../store/store-slice/store-api-actions';
import { Store } from '../../store/store-slice/store-slice-types';

import ErrorCard from '../../components/info-cards/ErrorCard';
import ListItem from '../../components/ui/ListItem';
import Loading from '../../components/Loading';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import { StartErrandProps } from '../screen-types';
import fontSizes from '../../constants/fontSizes';
import Dropdown from '../../components/ui/Dropdown';
import Input from '../../components/ui/Input';

type RoundListItem = {
  id: number;
  name: string;
};

export default function StartErrand({ navigation }: StartErrandProps) {
  const dispatch = useAppDispatch();
  const { isInternetReachable } = useNetInfo();
  const { deviceId, token, credentialsAvailable, tokenStorageError } = useToken();
  const storesFetched = useAppSelector((state) => state.storeList.fetched);
  const storeList = useAppSelector((state) => state.storeList.data);
  const currentStoreId = useAppSelector((state) => state.round.storeId);

  const [selectedRoundId, setSelectedRoundId] = useState<number>(currentStoreId ?? -1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [itemsError, setItemsError] = useState<string>('');
  const [partnersError, setPartnersError] = useState<string>('');
  const [storesError, setStoresError] = useState<string>('');
  const [storeError, setStoreError] = useState<string>('');
  const [roundError, setRoundError] = useState<string>('');

  const roundListItems: RoundListItem[] = sortBy(prop('name'), storeList);
  const confirmButtonvariant = selectedRoundId > 0 ? 'ok' : 'disabled';

  // const confirmPartnerHandler = async () => {
  //   setLoading(true);
  //   setLoadingMessage('Körindításhoz szükséges adatok letöltése folyamatban...');

  //   const selectedStoreCode: string = pipe(
  //     find(propEq('id', selectedRoundId)),
  //     prop('code')
  //   )(storeList);

  //   try {
  //     await dispatch(fetchItems({ deviceId, token }));
  //     setItemsError('');
  //   } catch (err) {
  //     setItemsError(err.message);
  //   }

  //   try {
  //     await dispatch(fetchPartners({ deviceId, token }));
  //     setPartnersError('');
  //   } catch (err) {
  //     setPartnersError(err.message);
  //   }

  //   let fetchedStore: Store | undefined;
  //   try {
  //     fetchedStore = await dispatch(
  //       fetchStore({ deviceId, token, code: selectedStoreCode })
  //     ).unwrap();
  //     setStoreError('');
  //   } catch (err) {
  //     setStoreError(err.message);
  //   }

  //   if (fetchedStore) {
  //     try {
  //       await dispatch(
  //         initializeRound({
  //           storeId: selectedRoundId,
  //           nextAvailableSerialNumber: fetchedStore.firstAvailableSerialNumber,
  //         })
  //       );
  //       setRoundError('');
  //     } catch (err) {
  //       setRoundError(err.message);
  //     }
  //   }

  //   if (!(itemsError || partnersError || storeError || roundError)) {
  //     navigation.pop();
  //   }
  // };

  useEffect(() => {
    if (isInternetReachable === false || tokenStorageError) {
      navigation.pop();
    }
  }, [isInternetReachable, navigation, tokenStorageError]);

  // useEffect(() => {
  //   const getStores = async () => {
  //     try {
  //       await dispatch(fetchStores({ deviceId, token }));
  //       setStoresError('');
  //       setLoading(false);
  //     } catch (err) {
  //       setStoresError(err.message);
  //       setLoading(false);
  //     }
  //   };

  //   if (credentialsAvailable && storesFetched === false) {
  //     setLoading(true);
  //     setLoadingMessage('Raktárak adatainak betöltése...');
  //     getStores();
  //   }
  // }, [credentialsAvailable, deviceId, dispatch, storesFetched, token]);

  // const selectRoundHandler = (id: number) => {
  //   setSelectedRoundId(id);
  // };

  const [name, setName] = useState<string>('');
  const [store, setStore] = useState<string>('');
  const [partner, setPartner] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());

  const onChange = (_, selectedDate: Date) => {
    setDate(selectedDate);
  };

  const showDatepicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange,
      mode: 'date',
      is24Hour: true,
      minimumDate: new Date(),
    });
  };

  if (loading) {
    return <Loading message={loadingMessage} />;
  }

  const names = [
    { key: '4', value: 'Denki Jusztin' },
    { key: '2', value: 'Geregye Béla' },
    { key: '5', value: 'Hétpróbás Töhötömné Palákovics Diána Kinga' },
    { key: '1', value: 'Kis Jenő' },
    { key: '3', value: 'Stohlman Márió' },
  ];

  const stores = [
    { key: '1', value: 'ABC-123' },
    { key: '2', value: 'ABC-124' },
    { key: '3', value: 'ABC-125' },
    { key: '4', value: 'ABC-126' },
    { key: '5', value: 'ABC-127' },
  ];

  const partners = [
    { key: '1', value: '1. kör' },
    { key: '2', value: '2. kör' },
    { key: '3', value: 'Harmadik kör' },
    { key: '4', value: 'Egy újabb kör valami izgalmas névvel' },
    { key: '5', value: 'Alsófelvégi Coop-ok' },
  ];

  return (
    <View style={styles.container}>
      {/* {!!itemsError && (
          <View style={styles.error}>
            <ErrorCard>{storeError}</ErrorCard>
          </View>
        )}
        {!!partnersError && (
          <View style={styles.error}>
            <ErrorCard>{storeError}</ErrorCard>
          </View>
        )}
        {!!storesError && (
          <View style={styles.error}>
            <ErrorCard>{storesError}</ErrorCard>
          </View>
        )}
        {!!storeError && (
          <View style={styles.error}>
            <ErrorCard>{storeError}</ErrorCard>
          </View>
        )}
        {!!roundError && (
          <View style={styles.error}>
            <ErrorCard>{roundError}</ErrorCard>
          </View>
        )} */}
      <View style={styles.inputContainer}>
        <Dropdown label="Felhasználó" data={names} onSelect={setName} />
      </View>
      <View style={styles.inputContainer}>
        <Dropdown label="Raktár" data={stores} onSelect={setStore} />
      </View>
      <View style={styles.inputContainer}>
        <Dropdown label="Partnerlista" data={partners} onSelect={setPartner} />
      </View>
      <View style={styles.dateContainer}>
        <Pressable onPress={showDatepicker} style={styles.dateInnerContainer}>
          <Input label="Dátum" config={{ editable: false, value: format(date, 'yyyy-MM-dd') }} />
        </Pressable>
      </View>
      <View style={styles.buttonContainer}>
        <Button variant={confirmButtonvariant} onPress={() => {}}>
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
