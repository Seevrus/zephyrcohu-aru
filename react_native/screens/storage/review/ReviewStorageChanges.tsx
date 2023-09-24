import { useNetInfo } from '@react-native-community/netinfo';
import { useMemo, useState } from 'react';
import { Alert, FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import Loading from '../../../components/Loading';
import ErrorCard from '../../../components/info-cards/ErrorCard';
import TextCard from '../../../components/info-cards/TextCard';
import Button from '../../../components/ui/Button';
import colors from '../../../constants/colors';
import { ListItem, useStorageFlowContext } from '../../../providers/StorageFlowProvider';
import { ReviewStorageChangesProps } from '../../screen-types';
import ReviewExpirationItem from './ReviewExpirationItem';

const keyExtractor = (item: ListItem) => String(item.expirationId);

export default function ReviewStorageChanges({ navigation }: ReviewStorageChangesProps) {
  const { isInternetReachable } = useNetInfo();
  const { items, handleSendChanges } = useStorageFlowContext();

  const changedItems = useMemo(
    () => (items ?? []).filter((item) => item.currentQuantity !== item.originalQuantity),
    [items]
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  if (isLoading) {
    return <Loading />;
  }

  const renderItem = (info: ListRenderItemInfo<ListItem>) => (
    <ReviewExpirationItem item={info.item} />
  );

  const confirmStorageChanges = () => {
    Alert.alert(
      'Rakodás véglegesítése',
      'A készülék szinkronizálja az adatokat a szerverrel és zárja a rakodási folyamatot.',
      [
        { text: 'Mégse' },
        {
          text: 'Folytatás',
          onPress: async () => {
            try {
              setIsLoading(true);
              setIsError(false);

              await handleSendChanges();

              navigation.reset({
                index: 1,
                routes: [{ name: 'StorageChangesSummary' }],
              });
            } catch {
              setIsError(true);
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const confirmButtonVariant = isInternetReachable ? 'ok' : 'disabled';

  return (
    <View style={styles.container}>
      {!isInternetReachable && (
        <View style={styles.cardContainer}>
          <TextCard>Az alkalmazás jelenleg internetkapcsolat nélkül működik.</TextCard>
        </View>
      )}
      {!!isError && (
        <View style={styles.cardContainer}>
          <ErrorCard>A rakodás mentése sikertelen.</ErrorCard>
        </View>
      )}
      <View style={styles.listContainer}>
        <FlatList data={changedItems} keyExtractor={keyExtractor} renderItem={renderItem} />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <Button variant={confirmButtonVariant} onPress={confirmStorageChanges}>
            Véglegesítés
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cardContainer: {
    marginTop: 30,
  },
  listContainer: {
    flex: 1,
  },
  footerContainer: {
    height: 70,
    paddingVertical: 10,
    borderTopColor: 'white',
    borderTopWidth: 2,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
