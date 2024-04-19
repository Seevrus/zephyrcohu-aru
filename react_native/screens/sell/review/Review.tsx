import { useNetInfo } from '@react-native-community/netinfo';
import { useAtomValue } from 'jotai';
import { Suspense, useCallback, useState } from 'react';
import {
  FlatList,
  type ListRenderItem,
  type ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';

import { type ReviewItem, reviewItemsAtom } from '../../../atoms/sellFlow';
import { Alert } from '../../../components/alert/Alert';
import { Container } from '../../../components/container/Container';
import { ErrorCard } from '../../../components/info-cards/ErrorCard';
import { Loading } from '../../../components/Loading';
import { Button } from '../../../components/ui/Button';
import { LabeledItem } from '../../../components/ui/LabeledItem';
import { colors } from '../../../constants/colors';
import { type ReviewProps } from '../../../navigators/screen-types';
import { formatPrice } from '../../../utils/formatPrice';
import { getReviewItemId } from './getReviewItemId';
import { OtherItemSelection } from './OtherItemSelection';
import { RegularItemSelection } from './RegularItemSelection';
import { useReviewData } from './useReviewData';

function SuspendedReview({ navigation }: ReviewProps) {
  const { isInternetReachable } = useNetInfo();

  const {
    isLoading,
    discountedGrossAmount,
    removeItemHandler,
    removeOtherItemHandler,
    saveReceiptError,
    removeReceiptHandler,
    canConfirm,
    surpriseError,
    confirmReceiptHandler,
    alert,
  } = useReviewData(navigation);

  const reviewItems = useAtomValue(reviewItemsAtom);

  const [selectedRow, setSelectedRow] = useState<ReviewItem | null>(null);

  const renderReceiptRow: ListRenderItem<ReviewItem> = useCallback(
    (info: ListRenderItemInfo<ReviewItem>) => {
      const reviewItemId = getReviewItemId(info.item);
      const selectedRowId = getReviewItemId(selectedRow);

      return info.item.type === 'item' ? (
        <RegularItemSelection
          selected={reviewItemId === selectedRowId}
          item={info.item}
          onSelect={(id: string | number) => {
            setSelectedRow(
              reviewItems?.find((row) => getReviewItemId(row) === id) ?? null
            );
          }}
          onDelete={removeItemHandler}
        />
      ) : (
        <OtherItemSelection
          selected={reviewItemId === selectedRowId}
          item={info.item}
          onSelect={(id: string) => {
            setSelectedRow(
              reviewItems?.find((row) => getReviewItemId(row) === id) ?? null
            );
          }}
          onDelete={removeOtherItemHandler}
        />
      );
    },
    [removeItemHandler, removeOtherItemHandler, reviewItems, selectedRow]
  );

  const confimButtonVariant = canConfirm ? 'ok' : 'disabled';

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container>
      {!!saveReceiptError && (
        <View style={styles.card}>
          <ErrorCard>{saveReceiptError}</ErrorCard>
        </View>
      )}
      {isInternetReachable === false && (
        <View style={styles.card}>
          <ErrorCard>
            A számla véglegesítéséhez internetkapcsolat szükséges.
          </ErrorCard>
        </View>
      )}
      {surpriseError ? (
        <View style={styles.card}>
          <ErrorCard>
            Az alkalmazás nem találja a számla készítéséhez szükséges olyan
            adatok egyikét, aminek feltétlenül meg kellene lennie. Ezt az
            üzenetet egyértelműen nem szabadna látnia, kérem azonnal lépjen
            kapcsolatba az alkalmazás fejlesztőjével!
          </ErrorCard>
        </View>
      ) : null}
      <View style={styles.headerContainer}>
        <View style={styles.headerButtonContainer}>
          <Button
            variant="ok"
            onPress={() => {
              navigation.navigate('SelectOtherItemsToSell');
            }}
          >
            Extra tételek
          </Button>
        </View>
      </View>
      <View style={styles.receiptContainer}>
        <FlatList
          data={reviewItems}
          renderItem={renderReceiptRow}
          keyExtractor={getReviewItemId}
        />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.grossAmountContainer}>
          <LabeledItem
            label="Mindösszesen"
            text={formatPrice(discountedGrossAmount)}
          />
        </View>
        <View style={styles.buttonsContainer}>
          <Button variant="warning" onPress={removeReceiptHandler}>
            Elvetés
          </Button>
          <Button variant={confimButtonVariant} onPress={confirmReceiptHandler}>
            Véglegesítés
          </Button>
        </View>
      </View>
      <Alert
        visible={alert.isAlertVisible}
        title={alert.alertTitle}
        message={alert.alertMessage}
        buttons={{
          cancel: {
            text: 'Mégsem',
            variant: 'neutral',
            onPress: alert.resetAlertHandler,
          },
          confirm: alert.alertConfirmButton,
        }}
        onBackdropPress={alert.resetAlertHandler}
      />
    </Container>
  );
}

export function Review(props: ReviewProps) {
  return (
    <Suspense fallback={<Container />}>
      <SuspendedReview {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: '7%',
  },
  card: {
    marginTop: 30,
  },
  footerContainer: {
    backgroundColor: colors.neutral,
    borderTopColor: colors.white,
    borderTopWidth: 2,
    height: 110,
    marginTop: 5,
  },
  grossAmountContainer: {
    alignItems: 'flex-end',
    marginHorizontal: '7%',
    marginVertical: 10,
  },
  headerButtonContainer: {
    width: '40%',
  },
  headerContainer: {
    alignItems: 'flex-end',
    height: 70,
    marginHorizontal: '7%',
    marginTop: 10,
  },
  receiptContainer: {
    flex: 1,
  },
});
