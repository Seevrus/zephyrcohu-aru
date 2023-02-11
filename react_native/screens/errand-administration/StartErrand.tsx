import { useNetInfo } from '@react-native-community/netinfo';
import { prop, sortBy } from 'ramda';
import { useEffect, useState } from 'react';
import { Animated, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import useToken from '../../hooks/useToken';

import { useAppDispatch, useAppSelector } from '../../store/hooks';

import ErrorCard from '../../components/info-cards/ErrorCard';
import ListItem from '../../components/ListItem';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import fetchStores from '../../store/store-list-slice/store-list-api-actions';
import { StartErrandProps } from '../screen-types';

type RoundListItem = {
  id: number;
  name: string;
};

export default function StartErrand({ navigation }: StartErrandProps) {
  const dispatch = useAppDispatch();
  const { isInternetReachable } = useNetInfo();
  const { deviceId, token, credentialsAvailable, tokenStorageError } = useToken();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedRoundId, setSelectedRoundId] = useState<number>(-1);

  const storesFetched = useAppSelector((state) => state.storeList.fetched);
  const storeList = useAppSelector((state) => state.storeList.data);

  const roundListItems: RoundListItem[] = sortBy(prop('name'), storeList);
  const confirmButtonvariant = selectedRoundId > 0 ? 'ok' : 'disabled';

  useEffect(() => {
    if (isInternetReachable === false || tokenStorageError) {
      navigation.replace('Index');
    }
  }, [isInternetReachable, navigation, tokenStorageError]);

  useEffect(() => {
    const getStores = async () => {
      try {
        await dispatch(fetchStores({ deviceId, token }));
        setErrorMessage('');
      } catch (err) {
        setErrorMessage(err.message);
      }
    };

    if (credentialsAvailable && !storesFetched) {
      getStores();
    }
  }, [credentialsAvailable, deviceId, dispatch, storesFetched, token]);

  const selectRoundHandler = (id: number) => {
    setSelectedRoundId(id);
  };

  const confirmPartnerHandler = () => {};

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

  return (
    <View style={styles.container}>
      {!!errorMessage && (
        <View style={styles.error}>
          <ErrorCard>{errorMessage}</ErrorCard>
        </View>
      )}
      <Animated.FlatList
        data={roundListItems}
        extraData={selectedRoundId}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRoundItem}
        ListFooterComponent={renderSelectButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  error: {
    marginVertical: 30,
  },
  buttonContainer: {
    marginTop: 30,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
