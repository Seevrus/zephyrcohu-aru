import * as Print from 'expo-print';
import { isNotNil } from 'ramda';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useCheckToken } from '../../api/queries/useCheckToken';
import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';
import { useReceiptsContext } from '../../providers/ReceiptsProvider';
import { useSellFlowContext } from '../../providers/SellFlowProvider';
import { type ContextReceipt } from '../../providers/types/receipts-provider-types';
import { Loading } from '../Loading';
import { Button } from '../ui/Button';
import { createReceiptHtml } from './createReceiptHtml';

export function PrintSection() {
  const { data: user, isPending: isUserPending } = useCheckToken();
  const { isPending: isSellFlowContextpending, selectedPartner } =
    useSellFlowContext();
  const {
    isPending: isReceiptsContextPending,
    currentReceipt,
    updateNumberOfPrintedCopies,
  } = useReceiptsContext();

  const [updateProgressMessage, setUpdateProgressMessage] =
    useState<string>('');

  const canPrintOriginalCopy =
    selectedPartner.invoiceCopies > currentReceipt.originalCopiesPrinted;

  const printButtonHandler = async () => {
    await Print.printAsync({
      html: createReceiptHtml({
        user,
        receipt: currentReceipt as ContextReceipt,
        partner: selectedPartner,
      }),
    });

    if (canPrintOriginalCopy && isNotNil(currentReceipt.id)) {
      setUpdateProgressMessage('Számla frissítése folyamatban...');
      await updateNumberOfPrintedCopies(currentReceipt.id);
      setUpdateProgressMessage('');
    }
  };

  if (
    isUserPending ||
    isSellFlowContextpending ||
    isReceiptsContextPending ||
    !!updateProgressMessage
  ) {
    return <Loading message={updateProgressMessage} />;
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
          A számlát{' '}
          <Text style={styles.numberOfReceipts}>
            {selectedPartner.invoiceCopies}
          </Text>{' '}
          eredeti példányban van lehetőség kinyomtatni. Ebből eddig{' '}
          <Text style={styles.numberOfReceipts}>
            {currentReceipt.originalCopiesPrinted}
          </Text>{' '}
          példány került nyomtatásra.
        </Text>
      ) : (
        <Text style={styles.text}>
          Az alábbi gombra kattintva számlamásolat nyomtatható.
        </Text>
      )}
      <View style={styles.buttonContainer}>
        <Button variant="ok" onPress={printButtonHandler}>
          {canPrintOriginalCopy
            ? 'Eredeti példány nyomtatása'
            : 'Másolat nyomtatása'}
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50,
  },
  numberOfReceipts: {
    color: colors.ok,
    fontWeight: '700',
  },
  text: {
    color: colors.white,
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
  },
});
