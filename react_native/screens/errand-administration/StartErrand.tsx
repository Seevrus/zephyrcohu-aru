import { MaterialIcons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { find, pipe, prop, propEq, sortBy } from 'ramda';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  Animated,
  ListRenderItem,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import useToken from '../../hooks/useToken';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchItems } from '../../store/items-slice/items-api-actions';
import { fetchPartners } from '../../store/partners-slice/partners-api-actions';
import { initializeRound } from '../../store/round-slice/round-api-actions';
import { fetchStores } from '../../store/store-list-slice/store-list-api-actions';
import { fetchStore } from '../../store/store-slice/store-api-actions';
import { FetchStoreResponse } from '../../store/store-slice/store-slice-types';

import ErrorCard from '../../components/info-cards/ErrorCard';
import ListItem from '../../components/ListItem';
import Loading from '../../components/Loading';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import { StartErrandProps } from '../screen-types';

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

  const confirmPartnerHandler = useCallback(async () => {
    setLoading(true);
    setLoadingMessage('Körindításhoz szükséges adatok letöltése folyamatban...');

    const selectedStoreCode: string = pipe(
      find(propEq('id', selectedRoundId)),
      prop('code')
    )(storeList);

    try {
      await dispatch(fetchItems({ deviceId, token }));
      setItemsError('');
    } catch (err) {
      setItemsError(err.message);
    }

    try {
      await dispatch(fetchPartners({ deviceId, token }));
      setPartnersError('');
    } catch (err) {
      setPartnersError(err.message);
    }

    let fetchedStore: FetchStoreResponse | undefined;
    try {
      fetchedStore = await dispatch(
        fetchStore({ deviceId, token, code: selectedStoreCode })
      ).unwrap();
      setStoreError('');
    } catch (err) {
      setStoreError(err.message);
    }

    if (fetchedStore) {
      try {
        await dispatch(
          initializeRound({
            storeId: selectedRoundId,
            nextAvailableSerialNumber: fetchedStore.firstAvailableSerialNumber,
          })
        );
        setRoundError('');
      } catch (err) {
        setRoundError(err.message);
      }
    }

    if (!(itemsError || partnersError || storeError || roundError)) {
      navigation.pop();
    }
  }, [
    deviceId,
    dispatch,
    itemsError,
    navigation,
    partnersError,
    roundError,
    selectedRoundId,
    storeError,
    storeList,
    token,
  ]);

  useLayoutEffect(() => {
    const renderHeaderNext = () => (
      <Pressable
        style={({ pressed }) => [pressed && { opacity: 0.75 }]}
        onPress={confirmPartnerHandler}
      >
        <MaterialIcons
          name="arrow-forward"
          size={28}
          color={selectedRoundId > 0 ? colors.ok : colors.disabled}
        />
      </Pressable>
    );

    navigation.setOptions({
      headerRight: renderHeaderNext,
    });
  }, [confirmPartnerHandler, navigation, selectedRoundId]);

  useEffect(() => {
    if (isInternetReachable === false || tokenStorageError) {
      navigation.pop();
    }
  }, [isInternetReachable, navigation, tokenStorageError]);

  useEffect(() => {
    const getStores = async () => {
      try {
        await dispatch(fetchStores({ deviceId, token }));
        setStoresError('');
        setLoading(false);
      } catch (err) {
        setStoresError(err.message);
        setLoading(false);
      }
    };

    if (credentialsAvailable && storesFetched === false) {
      setLoading(true);
      setLoadingMessage('Raktárak adatainak betöltése...');
      getStores();
    }
  }, [credentialsAvailable, deviceId, dispatch, storesFetched, token]);

  const selectRoundHandler = (id: number) => {
    setSelectedRoundId(id);
  };

  const renderRoundItem: ListRenderItem<RoundListItem> = (
    info: ListRenderItemInfo<RoundListItem>
  ) => (
    <ListItem
      id={info.item.id}
      title={info.item.name}
      selected={info.item.id === selectedRoundId}
      onPress={selectRoundHandler}
    />
  );

  const renderSelectButton = () => (
    <View style={styles.buttonContainer}>
      <Button variant={confirmButtonvariant} onPress={confirmPartnerHandler}>
        Partner kiválasztása és kör indítása
      </Button>
    </View>
  );

  if (loading) {
    return <Loading message={loadingMessage} />;
  }

  return (
    <View style={styles.container}>
      {!!itemsError && (
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
      )}
      <View style={styles.listContainer}>
        <Animated.FlatList
          data={roundListItems}
          extraData={selectedRoundId}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRoundItem}
          ListFooterComponent={renderSelectButton}
        />
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
  listContainer: {
    marginTop: 15,
  },
  buttonContainer: {
    marginTop: 30,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
