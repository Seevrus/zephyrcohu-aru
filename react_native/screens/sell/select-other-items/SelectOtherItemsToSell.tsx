import { MaterialCommunityIcons } from '@expo/vector-icons';
import { assoc, dissoc } from 'ramda';
import { useCallback, useMemo, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { Loading } from '../../../components/Loading';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LabeledItem } from '../../../components/ui/LabeledItem';
import { colors } from '../../../constants/colors';
import { type SelectOtherItemsToSellProps } from '../../../navigators/screen-types';
import { useSellFlowContext } from '../../../providers/SellFlowProvider';
import { type OtherSellItem } from '../../../providers/sell-flow-hooks/useSelectOtherItems';
import { calculateAmounts } from '../../../utils/calculateAmounts';
import { formatPrice } from '../../../utils/formatPrice';
import { ExpirationAccordionDetails } from './ExpirationAccordionDetails';

const NUM_ITEMS_SHOWN = 10;

export function SelectOtherItemsToSell({
  navigation,
}: SelectOtherItemsToSellProps) {
  const {
    isPending: isContextPending,
    otherItems,
    selectedOtherItems,
    setSelectedOtherItems,
    saveSelectedOtherItemsInFlow,
  } = useSellFlowContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [netTotal, grossTotal] = useMemo(
    () =>
      Object.entries(selectedOtherItems).reduce(
        (prev, curr) => {
          const [prevNetAmount, prevGrossAmount] = prev;
          const [itemId, { netPrice: userNetPrice, quantity }] = curr;

          const currentItem = otherItems?.find((item) => item.id === +itemId);

          if (!currentItem || quantity === null) {
            return prev;
          }

          const { netPrice, vatRate } = currentItem;
          const { netAmount, grossAmount } = calculateAmounts({
            netPrice: userNetPrice ?? netPrice,
            quantity,
            vatRate,
          });

          return [prevNetAmount + netAmount, prevGrossAmount + grossAmount];
        },
        [0, 0]
      ),
    [otherItems, selectedOtherItems]
  );

  const canConfirmItems = Object.values(selectedOtherItems)?.some(
    (oi) => !!oi?.quantity
  );
  const confirmButtonVariant = canConfirmItems ? 'ok' : 'disabled';
  const confirmItemsHandler = useCallback(async () => {
    if (canConfirmItems) {
      setIsLoading(true);
      await saveSelectedOtherItemsInFlow();
      setIsLoading(false);
      navigation.goBack();
    }
  }, [canConfirmItems, navigation, saveSelectedOtherItemsInFlow]);

  const priceChangeHandler = useCallback(
    (item: OtherSellItem, netPrice: number | null) => {
      setSelectedOtherItems((prevItems) => {
        const selectedOtherItem = prevItems[item.id];

        if (!selectedOtherItem) {
          return assoc(
            item.id,
            { netPrice, quantity: null, comment: null },
            prevItems
          );
        }

        if (
          netPrice === null &&
          selectedOtherItem.quantity === null &&
          selectedOtherItem.comment === null
        ) {
          return dissoc(item.id, prevItems);
        }

        return assoc(item.id, { ...selectedOtherItem, netPrice }, prevItems);
      });
    },
    [setSelectedOtherItems]
  );

  const quantityChangeHandler = useCallback(
    (item: OtherSellItem, quantity: number | null) => {
      setSelectedOtherItems((prevItems) => {
        const selectedOtherItem = prevItems[item.id];

        if (!selectedOtherItem) {
          return assoc(
            item.id,
            { netPrice: null, quantity, comment: null },
            prevItems
          );
        }

        if (
          selectedOtherItem.netPrice === null &&
          quantity === null &&
          selectedOtherItem.comment === null
        ) {
          return dissoc(item.id, prevItems);
        }

        return assoc(item.id, { ...selectedOtherItem, quantity }, prevItems);
      });
    },
    [setSelectedOtherItems]
  );

  const commentChangeHandler = useCallback(
    (item: OtherSellItem, comment: string | null) => {
      setSelectedOtherItems((prevItems) => {
        const selectedOtherItem = prevItems[item.id];

        if (!selectedOtherItem) {
          return assoc(
            item.id,
            { netPrice: null, quantity: null, comment },
            prevItems
          );
        }

        if (
          selectedOtherItem.netPrice === null &&
          selectedOtherItem.quantity === null &&
          comment === null
        ) {
          return dissoc(item.id, prevItems);
        }

        return assoc(item.id, { ...selectedOtherItem, comment }, prevItems);
      });
    },
    [setSelectedOtherItems]
  );

  const renderItem = useCallback(
    (info: ListRenderItemInfo<OtherSellItem>) => (
      <ExpirationAccordionDetails
        item={info.item}
        netPrice={
          selectedOtherItems[info.item.id]?.netPrice ??
          info.item.netPrice ??
          null
        }
        setNetPrice={priceChangeHandler}
        quantity={selectedOtherItems[info.item.id]?.quantity ?? null}
        setQuantity={quantityChangeHandler}
        comment={selectedOtherItems[info.item.id]?.comment ?? null}
        setComment={commentChangeHandler}
      />
    ),
    [
      commentChangeHandler,
      priceChangeHandler,
      quantityChangeHandler,
      selectedOtherItems,
    ]
  );

  if (isContextPending || isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons name="magnify" size={30} color="white" />
          <Input
            label=""
            labelPosition="left"
            value={searchTerm}
            config={{ onChangeText: setSearchTerm }}
          />
        </View>
      </View>
      <View style={styles.listContainer}>
        <Animated.FlatList
          data={otherItems.slice(0, NUM_ITEMS_SHOWN)}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
        />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.summaryContainer}>
          <LabeledItem
            label="Összesen"
            text={`${formatPrice(netTotal)} / ${formatPrice(grossTotal)}`}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button variant={confirmButtonVariant} onPress={confirmItemsHandler}>
            Kiválaszott tételek hozzáadása
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
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  footerContainer: {
    backgroundColor: colors.neutral,
    borderTopColor: colors.white,
    borderTopWidth: 2,
    height: 135,
    paddingVertical: 10,
  },
  headerContainer: {
    height: 65,
    marginVertical: 10,
  },
  listContainer: {
    flex: 1,
  },
  searchInputContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: '7%',
  },
  summaryContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
    marginHorizontal: '7%',
  },
});
