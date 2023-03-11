import { StyleSheet, Text, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { cancelReceipt } from '../../store/round-slice/round-api-actions';
import { getReceiptPayloadBySn } from '../../store/round-slice/round-api-mappers';

import PrintSection from '../../components/print-section/PrintSection';
import Button from '../../components/ui/Button';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import { ReceiptDetailsProps } from '../screen-types';

export default function ReceiptDetails({ route }: ReceiptDetailsProps) {
  const dispatch = useAppDispatch();
  const { serialNumber } = route.params;

  const currentReceipt = useAppSelector((state) =>
    state.round.receipts.find((r) => r.serialNumber === serialNumber)
  );
  const currentPartner = useAppSelector((state) =>
    state.partners.partners.find((p) => p.id === currentReceipt.partnerId)
  );
  const receiptPayload = useAppSelector((state) => getReceiptPayloadBySn(state, serialNumber));

  const canCancelReceipt = !currentReceipt.connectedSerialNumber;

  const cancelReceiptHandler = () => {
    dispatch(cancelReceipt(serialNumber));
  };

  return (
    <View style={styles.container}>
      <Text
        style={styles.header}
      >{`${receiptPayload.serialNumber}/${receiptPayload.yearCode}`}</Text>
      <PrintSection partner={currentPartner} receipt={receiptPayload} />
      {canCancelReceipt && (
        <View style={styles.buttonContainer}>
          <Button variant="warning" onPress={cancelReceiptHandler}>
            Számla sztornózása
          </Button>
        </View>
      )}
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
  buttonContainer: {
    marginTop: 50,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
