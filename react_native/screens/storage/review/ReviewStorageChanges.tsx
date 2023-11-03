import { useNetInfo } from '@react-native-community/netinfo';
import { useAtomValue } from 'jotai';
import { Suspense, useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { useSaveSelectedItems } from '../../../api/mutations/useSaveSelectedItems';
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

function SuspendedReviewStorageChanges({
  navigation,
}: ReviewStorageChangesProps) {
  const { isInternetReachable } = useNetInfo();

  const { mutateAsync: saveSelectedItems } = useSaveSelectedItems();

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

  const handleSendChanges = useCallback(async () => {
    try {
      if (storageListItems) {
        setIsLoading(true);

        if (changedItems.length > 0) {
          await saveSelectedItems(changedItems);
        }

        navigation.reset({
          index: 1,
          routes: [{ name: 'StorageChangesSummary' }],
        });
      }
    } catch {
      setIsLoading(false);
      setIsError(true);
    }
  }, [changedItems, navigation, saveSelectedItems, storageListItems]);

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
          onPress: handleSendChanges,
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

export function ReviewStorageChanges(props: ReviewStorageChangesProps) {
  return (
    <Suspense>
      <SuspendedReviewStorageChanges {...props} />
    </Suspense>
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
