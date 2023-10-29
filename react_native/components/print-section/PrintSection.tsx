import * as Print from 'expo-print';
import { StyleSheet, Text, View } from 'react-native';

import useCheckToken from '../../api/queries/useCheckToken';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import { useReceiptsContext } from '../../providers/ReceiptsProvider';
import { useSellFlowContext } from '../../providers/SellFlowProvider';
import { ContextReceipt } from '../../providers/types/receipts-provider-types';
import Loading from '../Loading';
import Button from '../ui/Button';
import createReceiptHtml from './createReceiptHtml';

export default function PrintSection() {
  const { data: user, isPending: isUserPending } = useCheckToken();
  const { isPending: isSellFlowContextpending, selectedPartner } = useSellFlowContext();
  const { isPending: isReceiptsContextPending, currentReceipt } = useReceiptsContext();

  const canPrintOriginalCopy = selectedPartner.invoiceCopies > currentReceipt.originalCopiesPrinted;

  const printButtonHandler = async () => {
    await Print.printAsync({
      html: createReceiptHtml({
        user,
        receipt: currentReceipt as ContextReceipt,
        partner: selectedPartner,
      }),
    });

    if (canPrintOriginalCopy) {
      // dispatch(increaseOriginalCopiesPrinted(receipt.serialNumber));
    }
  };

  if (isUserPending || isSellFlowContextpending || isReceiptsContextPending) {
    return <Loading />;
  }

  return (
    <>
      <Text style={styles.text}>
        Az eredeti számla formátuma:{' '}
        <Text style={styles.numberOfReceipts}>
          {selectedPartner.invoiceType === 'E' ? 'elektronikus' : 'papír alapú'}
        </Text>
        .
      </Text>
      {canPrintOriginalCopy ? (
        <Text style={styles.text}>
          A számlát <Text style={styles.numberOfReceipts}>{selectedPartner.invoiceCopies}</Text>{' '}
          eredeti példányban van lehetőség kinyomtatni. Ebből eddig{' '}
          <Text style={styles.numberOfReceipts}>{currentReceipt.originalCopiesPrinted}</Text>{' '}
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
