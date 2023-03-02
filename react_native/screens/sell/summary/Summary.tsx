import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { last, prop } from 'ramda';
import * as Print from 'expo-print';
import TextCard from '../../../components/info-cards/TextCard';
import Button from '../../../components/ui/Button';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import useToken from '../../../hooks/useToken';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { upsertReceipts } from '../../../store/round-slice/round-api-actions';
import { getLastReceiptPayload } from '../../../store/round-slice/round-api-mappers';
import { SummaryProps } from '../../screen-types';
import ErrorCard from '../../../components/info-cards/ErrorCard';
import createReceiptHtml from './createReceiptHtml';

export default function Summary({ navigation }: SummaryProps) {
  const dispatch = useAppDispatch();
  const { isInternetReachable } = useNetInfo();
  const { deviceId, token, credentialsAvailable } = useToken();

  const currentPartner = useAppSelector((state) =>
    state.partners.partners.find((p) => p.id === prop('partnerId', last(state.round.receipts)))
  );
  const receiptPayload = useAppSelector(getLastReceiptPayload);

  const [upsertReceiptSuccess, setUpsertReceiptSuccess] = useState<string>('');
  const [upsertReceiptError, setUpsertReceiptError] = useState<string>('');

  // Ha van internet, beküldjük az összes még nem beküldött számlát.
  useEffect(() => {
    const dispatchReceipts = async () => {
      try {
        // await dispatch(upsertReceipts({ deviceId, token }));
        setUpsertReceiptError('');
        setUpsertReceiptSuccess('Számla beküldése sikeres.');
      } catch (err) {
        setUpsertReceiptSuccess('');
        setUpsertReceiptError(err.message);
      }
    };

    if (isInternetReachable && credentialsAvailable) {
      dispatchReceipts();
    }
  }, [credentialsAvailable, deviceId, dispatch, isInternetReachable, token]);

  // Nyomtatás: megváltoztatHATja a kinyomtatott eredeti példányok számát. Ezt át kell írni, az isSent vissza false-ra, s mehet egy új beküldés, ha teljesülnek a feltételek.
  const printButtonHandler = async () => {
    await Print.printAsync({
      html: createReceiptHtml({ receipt: receiptPayload, partner: currentPartner }),
    });
  };

  const canPrintOriginalCopy = currentPartner.invoiceCopies > receiptPayload.originalCopiesPrinted;

  return (
    <View style={styles.container}>
      {!isInternetReachable && (
        <View style={styles.textCardContainer}>
          <TextCard>Internetkapcsolat hiányában a számla még nem került beküldésre.</TextCard>
        </View>
      )}
      {!!upsertReceiptSuccess && (
        <View style={styles.textCardContainer}>
          <TextCard>{upsertReceiptSuccess}</TextCard>
        </View>
      )}
      {!!upsertReceiptError && (
        <View style={styles.textCardContainer}>
          <ErrorCard>{upsertReceiptSuccess}</ErrorCard>
        </View>
      )}
      {canPrintOriginalCopy ? (
        <Text style={styles.text}>
          Számla mentése sikeres! A számlát{' '}
          <Text style={styles.numberOfReceipts}>{currentPartner.invoiceCopies}</Text> eredeti
          példányban van lehetőség kinyomtatni. Ebből eddig{' '}
          <Text style={styles.numberOfReceipts}>{receiptPayload.originalCopiesPrinted}</Text>{' '}
          példány került nyomtatásra.
        </Text>
      ) : (
        <Text style={styles.text}>
          Számla mentése sikeres! Az alábbi gombra kattintva számlamásolat nyomtatható.
        </Text>
      )}
      <View style={styles.buttonContainer}>
        <Button variant="ok" onPress={printButtonHandler}>
          {canPrintOriginalCopy ? 'Eredeti példány nyomtatása' : 'Másolat nyomtatása'}
        </Button>
      </View>
      <View style={styles.buttonContainer}>
        <Button variant="ok">Visszatérés a kezdőképernyőre</Button>
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
  textCardContainer: {
    marginBottom: 30,
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
