import { useNetInfo } from '@react-native-community/netinfo';
import { Suspense, useState } from 'react';
import {
  FlatList,
  type ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';

import { type StorageListItem } from '../../../atoms/storageFlow';
import { Alert } from '../../../components/alert/Alert';
import { Container } from '../../../components/container/Container';
import { ErrorCard } from '../../../components/info-cards/ErrorCard';
import { TextCard } from '../../../components/info-cards/TextCard';
import { Loading } from '../../../components/Loading';
import { Button } from '../../../components/ui/Button';
import { LabeledItem } from '../../../components/ui/LabeledItem';
import { colors } from '../../../constants/colors';
import { type ReviewStorageChangesProps } from '../../../navigators/screen-types';
import { ReviewExpirationItem } from './ReviewExpirationItem';
import { useReviewStorageChangesData } from './useReviewStorageChangesData';

const keyExtractor = (item: StorageListItem) => String(item.expirationId);

function SuspendedReviewStorageChanges({
  navigation,
}: ReviewStorageChangesProps) {
  const { isInternetReachable } = useNetInfo();

  const {
    isLoading,
    isError,
    changedItems,
    canConfirmStorageChanges,
    reallyUnexpectedBlocker,
    changedQuantities,
    handleSendChanges,
  } = useReviewStorageChangesData(navigation);

  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);

  if (isLoading) {
    return <Loading />;
  }

  const renderItem = (info: ListRenderItemInfo<StorageListItem>) => (
    <ReviewExpirationItem item={info.item} />
  );

  const confirmStorageChanges = () => {
    setIsAlertVisible(true);
  };

  const confirmButtonVariant = canConfirmStorageChanges ? 'ok' : 'disabled';

  return (
    <Container>
      {isInternetReachable === false && (
        <View style={styles.cardContainer}>
          <TextCard>
            Az alkalmazás jelenleg internetkapcsolat nélkül működik.
          </TextCard>
        </View>
      )}
      {reallyUnexpectedBlocker ? (
        <View style={styles.cardContainer}>
          <ErrorCard>
            Az alkalmazás nem találja a főkraktárat. Ezt az üzenetet
            egyértelműen nem szabadna látnia, kérem azonnal lépjen kapcsolatba
            az alkalmazás fejlesztőjével!
          </ErrorCard>
        </View>
      ) : null}
      {isError ? (
        <View style={styles.cardContainer}>
          <ErrorCard>A rakodás mentése sikertelen.</ErrorCard>
        </View>
      ) : null}
      <View style={styles.listContainer}>
        <FlatList
          data={changedItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.totalStorageChangeContainer}>
          <LabeledItem
            label="Mindösszesen"
            text={`${changedItems.length} termék / +${changedQuantities.up} / -${changedQuantities.down}`}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            variant={confirmButtonVariant}
            onPress={confirmStorageChanges}
          >
            Véglegesítés
          </Button>
        </View>
      </View>
      <Alert
        visible={isAlertVisible}
        title="Rakodás véglegesítése"
        message="A készülék szinkronizálja az adatokat a szerverrel és zárja a rakodási folyamatot."
        buttons={{
          cancel: {
            text: 'Mégsem',
            variant: 'neutral',
            onPress: () => {
              setIsAlertVisible(false);
            },
          },
          confirm: {
            text: 'Folytatás',
            variant: 'warning',
            onPress: handleSendChanges,
          },
        }}
        onBackdropPress={() => {
          setIsAlertVisible(false);
        }}
      />
    </Container>
  );
}

export function ReviewStorageChanges(props: ReviewStorageChangesProps) {
  return (
    <Suspense fallback={<Container />}>
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
  footerContainer: {
    borderTopColor: colors.white,
    borderTopWidth: 2,
    height: 110,
  },
  listContainer: {
    flex: 1,
  },
  totalStorageChangeContainer: {
    alignItems: 'flex-end',
    marginHorizontal: '7%',
    marginVertical: 10,
  },
});
