import * as Print from 'expo-print';
import { isNotNil } from 'ramda';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useCheckToken } from '../../api/queries/useCheckToken';
import { type Partner } from '../../api/response-mappers/mapPartnersResponse';
import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';
import { useReceiptsContext } from '../../providers/ReceiptsProvider';
import { type ContextReceipt } from '../../providers/types/receipts-provider-types';
import { Loading } from '../Loading';
import { Button } from '../ui/Button';
import { createReceiptHtml } from './createReceiptHtml';

type PrintSectionProps = {
  partner: Partner;
  receipt: ContextReceipt;
};

export function PrintSection({ partner, receipt }: PrintSectionProps) {
  const { data: user, isPending: isUserPending } = useCheckToken();
  const { isPending: isReceiptsContextPending, updateNumberOfPrintedCopies } =
    useReceiptsContext();

  const [updateProgressMessage, setUpdateProgressMessage] =
    useState<string>('');

  const canPrintOriginalCopy =
    partner?.invoiceCopies > receipt?.originalCopiesPrinted;

  const printButtonHandler = async () => {
    if (canPrintOriginalCopy && isNotNil(receipt.id)) {
      setUpdateProgressMessage('Számla frissítése folyamatban...');
      await updateNumberOfPrintedCopies(receipt.id);
      setUpdateProgressMessage('');
    }

    await Print.printAsync({
      html: createReceiptHtml({
        user,
        receipt,
        partner,
      }),
    });
  };

  if (isUserPending || isReceiptsContextPending || !!updateProgressMessage) {
    return <Loading message={updateProgressMessage} />;
  }

  return (
    <>
      <Text style={styles.text}>
        Az eredeti számla formátuma:{' '}
        <Text style={styles.numberOfReceipts}>
          {partner?.invoiceType === 'E' ? 'elektronikus' : 'papír alapú'}
        </Text>
        .
      </Text>
      {canPrintOriginalCopy ? (
        <Text style={styles.text}>
          A számlát{' '}
          <Text style={styles.numberOfReceipts}>{partner?.invoiceCopies}</Text>{' '}
          eredeti példányban van lehetőség kinyomtatni. Ebből eddig{' '}
          <Text style={styles.numberOfReceipts}>
            {receipt?.originalCopiesPrinted}
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
