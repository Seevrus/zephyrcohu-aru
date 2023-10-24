import { dissoc, dissocPath, reduce } from 'ramda';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  ListRenderItem,
  ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';

import Loading from '../../../components/Loading';
import ErrorCard from '../../../components/info-cards/ErrorCard';
import Button from '../../../components/ui/Button';
import LabeledItem from '../../../components/ui/LabeledItem';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { ReviewProps } from '../../../navigators/screen-types';
import { useSellFlowContext } from '../../../providers/SellFlowProvider';
import { ReviewItem } from '../../../providers/sell-flow-hooks/useReview';
import calculateAmounts from '../../../utils/calculateAmounts';
import formatPrice from '../../../utils/formatPrice';
import OtherItemSelection from './OtherItemSelection';
import RegularItemSelection from './RegularItemSelection';
import getReviewItemId from './getReviewItemId';

export default function Review({ navigation }: ReviewProps) {
  const {
    isPending: isContextPending,
    setSelectedItems,
    setSelectedOtherItems,
    reviewItems,
    resetSellFlowContext,
  } = useSellFlowContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<ReviewItem>(null);
  const [saveReceiptError, setSaveReceiptError] = useState<string>('');

  const discountedGrossAmount = useMemo(
    () =>
      reduce(
        (accumulatedGrossAmount, reviewItem) => {
          if (!reviewItem.selectedDiscounts) {
            return accumulatedGrossAmount + reviewItem.grossAmount;
          }

          const [totalDiscountedQuantity, totalDiscountedGrossAmount] =
            reviewItem.selectedDiscounts.reduce(
              ([accumulatedDiscountedQuantity, accumulatedDiscountedGrossAmount], discount) => {
                let newNetPrice: number;
                switch (discount.type) {
                  case 'absolute':
                    newNetPrice = reviewItem.netPrice - discount.amount;
                    break;
                  case 'percentage':
                    newNetPrice = reviewItem.netPrice * (100 - discount.amount);
                    break;
                  case 'freeForm':
                    newNetPrice = discount.price ?? 1;
                    break;
                  default:
                    newNetPrice = reviewItem.netPrice;
                }

                const { grossAmount: discountGrossAmount } = calculateAmounts({
                  netPrice: newNetPrice,
                  quantity: discount.quantity,
                  vatRate: reviewItem.vatRate,
                });

                return [
                  accumulatedDiscountedQuantity + discount.quantity,
                  accumulatedDiscountedGrossAmount + discountGrossAmount,
                ];
              },
              [0, 0]
            );

          if (totalDiscountedQuantity === reviewItem.quantity) {
            return totalDiscountedGrossAmount;
          }

          const { grossAmount: listPricedGrossAmount } = calculateAmounts({
            netPrice: reviewItem.netPrice,
            quantity: reviewItem.quantity - totalDiscountedQuantity,
            vatRate: reviewItem.vatRate,
          });

          return listPricedGrossAmount + totalDiscountedGrossAmount;
        },
        0,
        reviewItems
      ),
    [reviewItems]
  );

  const removeItemHandler = useCallback(
    ({ itemId, expirationId }: { itemId: number; expirationId: number }) => {
      setSelectedItems((prevItems) => {
        if (Object.keys(prevItems[itemId]).length === 1) {
          return dissoc(itemId, prevItems);
        }

        return dissocPath([itemId, expirationId], prevItems);
      });
    },
    [setSelectedItems]
  );

  const removeOtherItemHandler = useCallback(
    (otherItemId: number) => {
      setSelectedOtherItems(dissoc(otherItemId));
    },
    [setSelectedOtherItems]
  );

  useEffect(() => {
    const numberOfRegularReviewItems = reviewItems?.reduce(
      (numberOfItems, item) => (item.type === 'item' ? numberOfItems + 1 : numberOfItems),
      0
    );

    if (reviewItems && numberOfRegularReviewItems === 0) {
      setIsLoading(true);
      resetSellFlowContext().then(() => {
        setIsLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Index' }],
        });
      });
    }
  }, [navigation, resetSellFlowContext, reviewItems]);

  const removeReceiptHandler = useCallback(() => {
    Alert.alert(
      'Folyamat törlése',
      'Ez a lépés törli a jelenlegi árulevételi munkamenetet és visszairányít a kezdőoldalra. Biztosan folytatni szeretné?',
      [
        { text: 'Mégse' },
        {
          text: 'Biztosan ezt szeretném',
          onPress: async () => {
            setIsLoading(true);
            await resetSellFlowContext();
            setIsLoading(false);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Index' }],
            });
          },
        },
      ]
    );
  }, [navigation, resetSellFlowContext]);

  /* const confirmReceiptHandler = async () => {
    Alert.alert(
      'Árulevétel véglegesítése',
      'Ez a lépés számlakészítéssel jár, ezután már nem lesz lehetőség semmilyen módosításra. Biztosan folytatni szeretné?',
      [
        { text: 'Mégse' },
        {
          text: 'Biztosan ezt szeretném',
          onPress: async () => {
            try {
              await dispatch(removeItemsFromStore());
              await dispatch(finalizeCurrentReceipt());
              navigation.reset({
                index: 1,
                routes: [{ name: 'Index' }, { name: 'Summary' }],
              });
            } catch (err) {
              setSaveReceiptError(err.message);
            }
          },
        },
      ]
    );
  }; */

  const renderReceiptRow: ListRenderItem<ReviewItem> = (info: ListRenderItemInfo<ReviewItem>) => {
    const reviewItemId = getReviewItemId(info.item);
    const selectedRowId = getReviewItemId(selectedRow);

    return info.item.type === 'item' ? (
      <RegularItemSelection
        selected={reviewItemId === selectedRowId}
        item={info.item}
        onSelect={(id: string) => {
          setSelectedRow(reviewItems.find((row) => getReviewItemId(row) === id));
        }}
        onDelete={removeItemHandler}
      />
    ) : (
      <OtherItemSelection
        selected={reviewItemId === selectedRowId}
        item={info.item}
        onSelect={(id: string) => {
          setSelectedRow(reviewItems.find((row) => getReviewItemId(row) === id));
        }}
        onDelete={removeOtherItemHandler}
      />
    );
  };

  if (isLoading || isContextPending) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {!!saveReceiptError && (
        <View style={styles.error}>
          <ErrorCard>{saveReceiptError}</ErrorCard>
        </View>
      )}
      <View style={styles.headerContainer}>
        <View style={styles.headerButtonContainer}>
          <Button variant="ok" onPress={() => {}}>
            Extra tételek
          </Button>
        </View>
      </View>
      <View style={styles.receiptContainer}>
        <FlatList data={reviewItems} renderItem={renderReceiptRow} keyExtractor={getReviewItemId} />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.grossAmountContainer}>
          <LabeledItem label="Mindösszesen" text={formatPrice(discountedGrossAmount)} />
        </View>
        <View style={styles.buttonsContainer}>
          <Button variant="warning" onPress={removeReceiptHandler}>
            Elvetés
          </Button>
          <Button variant="ok" onPress={() => {}}>
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
  error: {
    marginTop: 30,
  },
  headerContainer: {
    height: 70,
    marginHorizontal: '7%',
    marginTop: 10,
    alignItems: 'flex-end',
  },
  headerButtonContainer: {
    width: '40%',
  },
  receiptContainer: {
    flex: 1,
  },
  fieldContainer: {
    marginTop: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionLabel: {
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationColor: 'white',
  },
  itemLabel: {
    fontWeight: '700',
    marginRight: 5,
  },
  receiptText: {
    color: 'white',
    fontSize: fontSizes.input,
  },
  sectionBorder: {
    borderColor: 'white',
    borderWidth: 1,
    marginVertical: 10,
  },
  footerContainer: {
    height: 110,
    marginTop: 5,
    backgroundColor: colors.neutral,
    borderTopColor: 'white',
    borderTopWidth: 2,
  },
  grossAmountContainer: {
    alignItems: 'flex-end',
    marginHorizontal: '7%',
    marginVertical: 10,
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: '7%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
