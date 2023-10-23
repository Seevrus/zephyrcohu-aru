import { MaterialCommunityIcons } from '@expo/vector-icons';
import { assoc, dissoc, isEmpty, not } from 'ramda';
import { useCallback, useMemo, useState } from 'react';
import { Animated, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import Loading from '../../../components/Loading';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import LabeledItem from '../../../components/ui/LabeledItem';
import colors from '../../../constants/colors';
import { useSellFlowContext } from '../../../providers/SellFlowProvider';
import { OtherSellItem } from '../../../providers/sell-flow-hooks/useSelectOtherItems';
import calculateAmounts from '../../../utils/calculateAmounts';
import formatPrice from '../../../utils/formatPrice';
import ExpirationAccordionDetails from './ExpirationAccordionDetails';

const NUM_ITEMS_SHOWN = 10;

export default function SelectOtherItemsToSell({ navigation }) {
  const {
    isLoading: isContextLoading,
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
          const [itemId, { quantity }] = curr;

          const currentItem = otherItems?.find((item) => item.id === +itemId);

          if (!currentItem || quantity === null) {
            return prev;
          }

          const { netPrice, vatRate } = currentItem;
          const { netAmount, grossAmount } = calculateAmounts({
            netPrice,
            quantity,
            vatRate,
          });

          return [prevNetAmount + netAmount, prevGrossAmount + grossAmount];
        },
        [0, 0]
      ),
    [otherItems, selectedOtherItems]
  );

  const canConfirmItems = not(isEmpty(selectedOtherItems));
  const confirmButtonVariant = canConfirmItems ? 'ok' : 'disabled';
  const confirmItemsHandler = useCallback(async () => {
    if (canConfirmItems) {
      setIsLoading(true);
      await saveSelectedOtherItemsInFlow();
      setIsLoading(false);
      navigation.goBack();
    }
  }, [canConfirmItems, navigation, saveSelectedOtherItemsInFlow]);

  const quantityChangeHandler = useCallback(
    (item: OtherSellItem, quantity: number | null) => {
      setSelectedOtherItems((prevItems) => {
        const selectedOtherItem = prevItems[item.id];

        if (!selectedOtherItem) {
          return assoc(item.id, { quantity, comment: null }, prevItems);
        }

        if (selectedOtherItem.comment === null && quantity === null) {
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
          return assoc(item.id, { quantity: null, comment }, prevItems);
        }

        if (selectedOtherItem.quantity === null && comment === null) {
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
        quantity={selectedOtherItems[info.item.id]?.quantity ?? null}
        setQuantity={quantityChangeHandler}
        comment={selectedOtherItems[info.item.id]?.comment ?? null}
        setComment={commentChangeHandler}
      />
    ),
    [commentChangeHandler, quantityChangeHandler, selectedOtherItems]
  );

  if (isContextLoading || isLoading) {
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
          data={[].slice(0, NUM_ITEMS_SHOWN)}
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
            Tétellista véglegesítése
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
  headerContainer: {
    height: 65,
    marginVertical: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: '7%',
  },
  listContainer: {
    flex: 1,
  },
  footerContainer: {
    height: 135,
    paddingVertical: 10,
    borderTopColor: 'white',
    borderTopWidth: 2,
    backgroundColor: colors.neutral,
  },
  summaryContainer: {
    marginHorizontal: '7%',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
