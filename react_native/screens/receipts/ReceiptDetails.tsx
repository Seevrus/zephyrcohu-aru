import { StyleSheet, Text, View } from 'react-native';

import { useAppSelector } from '../../store/hooks';
import { getReceiptPayloadBySn } from '../../store/round-slice/round-api-mappers';

import PrintSection from '../../components/print-section/PrintSection';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import { ReceiptDetailsProps } from '../screen-types';

export default function ReceiptDetails({ route }: ReceiptDetailsProps) {
  const { serialNumber } = route.params;

  const currentReceipt = useAppSelector((state) =>
    state.round.receipts.find((r) => r.serialNumber === serialNumber)
  );
  const currentPartner = useAppSelector((state) =>
    state.partners.partners.find((p) => p.id === currentReceipt.partnerId)
  );
  const receiptPayload = useAppSelector((state) => getReceiptPayloadBySn(state, serialNumber));

  return (
    <View style={styles.container}>
      <Text
        style={styles.header}
      >{`${receiptPayload.serialNumber}/${receiptPayload.yearCode}`}</Text>
      <PrintSection partner={currentPartner} receipt={receiptPayload} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: '7%',
    paddingTop: 20,
  },
  header: {
    marginBottom: 20,
    alignSelf: 'center',
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.subtitle,
  },
});
