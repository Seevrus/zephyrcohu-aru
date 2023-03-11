import * as Print from 'expo-print';
import { StyleSheet, Text, View } from 'react-native';

import { useAppDispatch } from '../../store/hooks';
import { PartnerDetails } from '../../store/partners-slice/partners-slice-types';
import { increaseOriginalCopiesPrinted } from '../../store/round-slice/round-api-actions';
import { ReceiptRequestItem } from '../../store/round-slice/round-slice-types';

import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import Button from '../ui/Button';
import createReceiptHtml from './createReceiptHtml';

type PrintSectionProps = {
  partner: PartnerDetails;
  receipt: ReceiptRequestItem;
};

export default function PrintSection({ partner, receipt }: PrintSectionProps) {
  const dispatch = useAppDispatch();
  const canPrintOriginalCopy = partner.invoiceCopies > receipt.originalCopiesPrinted;

  const printButtonHandler = async () => {
    await Print.printAsync({
      html: createReceiptHtml({ receipt, partner }),
    });

    if (canPrintOriginalCopy) {
      dispatch(increaseOriginalCopiesPrinted(receipt.serialNumber));
    }
  };

  return (
    <>
      <Text style={styles.text}>
        Az eredeti számla formátuma:{' '}
        <Text style={styles.numberOfReceipts}>
          {partner.invoiceType === 'E' ? 'elektronikus' : 'papír alapú'}
        </Text>
        .
      </Text>
      {canPrintOriginalCopy ? (
        <Text style={styles.text}>
          A számlát <Text style={styles.numberOfReceipts}>{partner.invoiceCopies}</Text> eredeti
          példányban van lehetőség kinyomtatni. Ebből eddig{' '}
          <Text style={styles.numberOfReceipts}>{receipt.originalCopiesPrinted}</Text> példány
          került nyomtatásra.
        </Text>
      ) : (
        <Text style={styles.text}>Az alábbi gombra kattintva számlamásolat nyomtatható.</Text>
      )}
      <View style={styles.buttonContainer}>
        <Button variant="ok" onPress={printButtonHandler}>
          {canPrintOriginalCopy ? 'Eredeti példány nyomtatása' : 'Másolat nyomtatása'}
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
