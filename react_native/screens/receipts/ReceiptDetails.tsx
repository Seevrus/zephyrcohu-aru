import * as Print from 'expo-print';
import { StyleSheet, Text, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { increaseOriginalCopiesPrinted } from '../../store/round-slice/round-api-actions';
import { getReceiptPayloadBySn } from '../../store/round-slice/round-api-mappers';

import Button from '../../components/ui/Button';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import { ReceiptDetailsProps } from '../screen-types';
import createReceiptHtml from '../sell/summary/createReceiptHtml';

export default function ReceiptDetails({ route }: ReceiptDetailsProps) {
  const { serialNumber } = route.params;

  const dispatch = useAppDispatch();

  const currentReceipt = useAppSelector((state) =>
    state.round.receipts.find((r) => r.serialNumber === serialNumber)
  );
  const currentPartner = useAppSelector((state) =>
    state.partners.partners.find((p) => p.id === currentReceipt.partnerId)
  );
  const receiptPayload = useAppSelector((state) => getReceiptPayloadBySn(state, serialNumber));
  const canPrintOriginalCopy = currentPartner.invoiceCopies > receiptPayload.originalCopiesPrinted;

  const printButtonHandler = async () => {
    await Print.printAsync({
      html: createReceiptHtml({ receipt: receiptPayload, partner: currentPartner }),
    });

    if (canPrintOriginalCopy) {
      dispatch(increaseOriginalCopiesPrinted(serialNumber));
    }
  };

  return (
    <View style={styles.container}>
      <Text
        style={styles.header}
      >{`${receiptPayload.serialNumber}/${receiptPayload.yearCode}`}</Text>
      <Text style={styles.text}>
        Az eredeti számla formátuma:{' '}
        <Text style={styles.numberOfReceipts}>
          {currentPartner.invoiceType === 'E' ? 'elektronikus' : 'papír alapú'}
        </Text>
        .
      </Text>
      {canPrintOriginalCopy ? (
        <Text style={styles.text}>
          A számlát <Text style={styles.numberOfReceipts}>{currentPartner.invoiceCopies}</Text>{' '}
          eredeti példányban van lehetőség kinyomtatni. Ebből eddig{' '}
          <Text style={styles.numberOfReceipts}>{receiptPayload.originalCopiesPrinted}</Text>{' '}
          példány került nyomtatásra.
        </Text>
      ) : (
        <Text style={styles.text}>Az alábbi gombra kattintva számlamásolat nyomtatható.</Text>
      )}
      <View style={styles.buttonContainer}>
        <Button variant="ok" onPress={printButtonHandler}>
          {canPrintOriginalCopy ? 'Eredeti példány nyomtatása' : 'Másolat nyomtatása'}
        </Button>
      </View>
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
  text: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
  },
  numberOfReceipts: {
    color: colors.ok,
    fontWeight: '700',
  },
  buttonContainer: {
    marginTop: 50,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
