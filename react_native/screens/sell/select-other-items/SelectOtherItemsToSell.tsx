import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAtomValue } from 'jotai';
import { Suspense, useCallback, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { selectedOtherItemsAtom } from '../../../atoms/sellFlow';
import { Loading } from '../../../components/Loading';
import { Container } from '../../../components/container/Container';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LabeledItem } from '../../../components/ui/LabeledItem';
import { colors } from '../../../constants/colors';
import { type SelectOtherItemsToSellProps } from '../../../navigators/screen-types';
import { formatPrice } from '../../../utils/formatPrice';
import { ExpirationAccordionDetails } from './ExpirationAccordionDetails';
import {
  useSelectOtherItemsToSellData,
  type OtherSellItem,
} from './useSelectOtherItemsToSellData';

function SuspendedSelectOtherItemsToSell({
  navigation,
}: SelectOtherItemsToSellProps) {
  const {
    isLoading,
    otherItems,
    priceChangeHandler,
    quantityChangeHandler,
    commentChangeHandler,
    netTotal,
    grossTotal,
    canConfirmItems,
    confirmItemsHandler,
  } = useSelectOtherItemsToSellData(navigation);

  const selectedOtherItems = useAtomValue(selectedOtherItemsAtom);

  const [searchTerm, setSearchTerm] = useState<string>('');

  const confirmButtonVariant = canConfirmItems ? 'ok' : 'disabled';

  const renderItem = useCallback(
    (info: ListRenderItemInfo<OtherSellItem>) => (
      <ExpirationAccordionDetails
        item={info.item}
        netPrice={
          selectedOtherItems[info.item.id]?.netPrice ??
          (info.item.netPrice || null)
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container>
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
          data={otherItems}
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
    </Container>
  );
}

export function SelectOtherItemsToSell(props: SelectOtherItemsToSellProps) {
  return (
    <Suspense fallback={<Container />}>
      <SuspendedSelectOtherItemsToSell {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
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
