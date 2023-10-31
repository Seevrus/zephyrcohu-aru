import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { usePartners } from '../../api/queries/usePartners';
import { Loading } from '../../components/Loading';
import { PrintSection } from '../../components/print-section/PrintSection';
import { colors } from '../../constants/colors';
import { type ReceiptDetailsProps } from '../../navigators/screen-types';
import { useReceiptsContext } from '../../providers/ReceiptsProvider';

export function ReceiptDetails({ navigation, route }: ReceiptDetailsProps) {
  const { serialNumber } = route.params;

  const { isPending: isPartnersPending, data: partners } = usePartners();
  const { isPending: isReceiptsContextPending, receipts } =
    useReceiptsContext();

  const currentReceipt = useMemo(
    () => receipts?.find((receipt) => receipt.serialNumber === serialNumber),
    [receipts, serialNumber]
  );

  const currentPartner = useMemo(
    () => partners?.find((partner) => partner.id === currentReceipt.buyer.id),
    [currentReceipt.buyer.id, partners]
  );

  const title = `${currentReceipt.serialNumber}/${currentReceipt.yearCode}`;

  useEffect(() => {
    navigation.setOptions({ headerTitle: title });
  }, [navigation, title]);

  if (isPartnersPending || isReceiptsContextPending) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <PrintSection partner={currentPartner} receipt={currentReceipt} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: '7%',
    paddingTop: 20,
  },
});
