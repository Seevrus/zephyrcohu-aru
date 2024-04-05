import { useAtomValue } from 'jotai';
import { Suspense } from 'react';
import {
  FlatList,
  type ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';

import { type ContextReceipt, receiptsAtom } from '../../atoms/receipts';
import { Loading } from '../../components/Loading';
import { colors } from '../../constants/colors';
import { type ReceiptListProps } from '../../navigators/screen-types';
import { ReceiptListItem } from './ReceiptListItem';

function SuspendedReceiptList({ navigation }: ReceiptListProps) {
  const receipts = useAtomValue(receiptsAtom);

  const receiptListItemPressHandler = (serialNumber: number) => {
    navigation.navigate('ReceiptDetails', { serialNumber });
  };

  const renderReceiptListItem = (info: ListRenderItemInfo<ContextReceipt>) => (
    <ReceiptListItem
      partnerName={info.item.buyer.deliveryName}
      serialNumber={info.item.serialNumber}
      yearCode={info.item.yearCode}
      total={info.item.grossAmount}
      onPress={receiptListItemPressHandler}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={receipts}
        keyExtractor={(item) => String(item.serialNumber)}
        renderItem={renderReceiptListItem}
      />
    </View>
  );
}

export function ReceiptList(props: ReceiptListProps) {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedReceiptList {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: '7%',
  },
});
