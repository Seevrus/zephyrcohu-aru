import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { Loading } from '../../components/Loading';
import { colors } from '../../constants/colors';
import { type ReceiptListProps } from '../../navigators/screen-types';
import { useReceiptsContext } from '../../providers/ReceiptsProvider';
import { type ContextReceipt } from '../../providers/types/receipts-provider-types';
import { ReceiptListItem } from './ReceiptListItem';

export function ReceiptList({ navigation }: ReceiptListProps) {
  const { isPending: isReceiptsContextPending, receipts } =
    useReceiptsContext();

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

  if (isReceiptsContextPending) {
    return <Loading />;
  }

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

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: '7%',
  },
});
