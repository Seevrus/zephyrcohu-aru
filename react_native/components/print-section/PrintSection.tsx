import { useNetInfo } from '@react-native-community/netinfo';
import { printAsync } from 'expo-print';
import { useAtom } from 'jotai';
import { isNotNil, prop } from 'ramda';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useUpdateReceipts } from '../../api/mutations/useUpdateReceipts';
import { useCheckToken } from '../../api/queries/useCheckToken';
import { type Partner } from '../../api/response-mappers/mapPartnersResponse';
import { type ContextReceipt, receiptsAtom } from '../../atoms/receipts';
import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';
import { Loading } from '../Loading';
import { Button } from '../ui/Button';
import { createReceiptHtml } from './createReceiptHtml';

type PrintSectionProps = {
  partner: Partner | undefined;
  receipt: ContextReceipt | undefined;
};

export function PrintSection({ partner, receipt }: PrintSectionProps) {
  const { isInternetReachable } = useNetInfo();
  const { data: user, isPending: isUserPending } = useCheckToken();

  const {
    mutateAsync: updateReceiptsAPI,
    isPending: isUpdateReceiptsAPIPending,
  } = useUpdateReceipts();

  const [receipts, setReceipts] = useAtom(receiptsAtom);

  const updateNumberOfPrintedCopies = useCallback(async () => {
    if (!!partner && !!receipt) {
      let updatedReceipts = receipts.map((rcpt) => {
        if (rcpt.id !== receipt.id) {
          return rcpt;
        }

        return {
          ...rcpt,
          originalCopiesPrinted: (rcpt.originalCopiesPrinted ?? 0) + 1,
          shouldBeUpdated: true,
        };
      });

      if (isInternetReachable === true) {
        const updateReceiptsResult = await updateReceiptsAPI(
          updatedReceipts.filter(prop('shouldBeUpdated'))
        );

        updatedReceipts = receipts.map((receipt) => {
          const updateReceiptResult = updateReceiptsResult.find(
            (result) => result.id === receipt.id
          );

          if (!updateReceiptResult) {
            return receipt;
          }

          return {
            ...receipt,
            originalCopiesPrinted: updateReceiptResult.originalCopiesPrinted,
            shouldBeUpdated: false,
          };
        });
      }

      await setReceipts(updatedReceipts);
    }
  }, [
    isInternetReachable,
    partner,
    receipt,
    receipts,
    setReceipts,
    updateReceiptsAPI,
  ]);

  const [updateProgressMessage, setUpdateProgressMessage] =
    useState<string>('');

  const canPrint = !!user && !!receipt;

  const canPrintOriginalCopy =
    (partner?.invoiceCopies ?? 0) > (receipt?.originalCopiesPrinted ?? 0);

  const printButtonVariant = canPrint ? 'ok' : 'disabled';

  const printButtonHandler = async () => {
    if (canPrintOriginalCopy && isNotNil(receipt)) {
      setUpdateProgressMessage('Számla frissítése folyamatban...');
      await updateNumberOfPrintedCopies();
      setUpdateProgressMessage('');
    }

    if (!!partner && !!receipt) {
      await printAsync({
        html: createReceiptHtml({
          user,
          receipt,
          partner,
        }),
      });
    }
  };

  if (isUserPending || isUpdateReceiptsAPIPending || !!updateProgressMessage) {
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
        <Button variant={printButtonVariant} onPress={printButtonHandler}>
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
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.body,
  },
});
