import { useNetInfo } from '@react-native-community/netinfo';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import {
  storageListItemsAtom,
  type StorageListItem,
} from '../../../atoms/storageFlow';
import { Loading } from '../../../components/Loading';
import { ErrorCard } from '../../../components/info-cards/ErrorCard';
import { TextCard } from '../../../components/info-cards/TextCard';
import { Button } from '../../../components/ui/Button';
import { colors } from '../../../constants/colors';
import { type ReviewStorageChangesProps } from '../../../navigators/screen-types';
import { ReviewExpirationItem } from './ReviewExpirationItem';

const keyExtractor = (item: StorageListItem) => String(item.expirationId);

export function ReviewStorageChanges({
  navigation,
}: ReviewStorageChangesProps) {
  const { isInternetReachable } = useNetInfo();
  const storageListItems = useAtomValue(storageListItemsAtom);

  const changedItems = useMemo(
    () =>
      (storageListItems ?? []).filter(
        (item) => item.currentQuantity !== item.originalQuantity
      ),
    [storageListItems]
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  if (isLoading) {
    return <Loading />;
  }

  const renderItem = (info: ListRenderItemInfo<StorageListItem>) => (
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
          <TextCard>
            Az alkalmazás jelenleg internetkapcsolat nélkül működik.
          </TextCard>
        </View>
      )}
      {!!isError && (
        <View style={styles.cardContainer}>
          <ErrorCard>A rakodás mentése sikertelen.</ErrorCard>
        </View>
      )}
      <View style={styles.listContainer}>
        <FlatList
          data={changedItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <Button
            variant={confirmButtonVariant}
            onPress={confirmStorageChanges}
          >
            Véglegesítés
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  cardContainer: {
    marginTop: 30,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  footerContainer: {
    borderTopColor: colors.white,
    borderTopWidth: 2,
    height: 70,
    paddingVertical: 10,
  },
  listContainer: {
    flex: 1,
  },
});
