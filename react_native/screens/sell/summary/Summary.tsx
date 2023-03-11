import { useNetInfo } from '@react-native-community/netinfo';
import { last, prop } from 'ramda';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { upsertReceipts } from '../../../store/round-slice/round-api-actions';
import { getLastReceiptPayload } from '../../../store/round-slice/round-api-mappers';

import ErrorCard from '../../../components/info-cards/ErrorCard';
import TextCard from '../../../components/info-cards/TextCard';
import Loading from '../../../components/Loading';
import PrintSection from '../../../components/print-section/PrintSection';
import Button from '../../../components/ui/Button';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import useToken from '../../../hooks/useToken';
import { SummaryProps } from '../../screen-types';

export default function Summary({ navigation }: SummaryProps) {
  const dispatch = useAppDispatch();
  const { isInternetReachable } = useNetInfo();
  const { deviceId, token, credentialsAvailable } = useToken();

  const currentPartner = useAppSelector((state) =>
    state.partners.partners.find((p) => p.id === prop('partnerId', last(state.round.receipts)))
  );
  const receiptPayload = useAppSelector(getLastReceiptPayload);

  const [loading, setLoading] = useState<boolean>(false);
  const [upsertReceiptSuccess, setUpsertReceiptSuccess] = useState<string>('');
  const [upsertReceiptError, setUpsertReceiptError] = useState<string>('');

  useEffect(() => {
    const dispatchReceipts = async () => {
      setLoading(true);
      try {
        await dispatch(upsertReceipts({ deviceId, token }));
        setUpsertReceiptError('');
        setUpsertReceiptSuccess('Számla beküldése sikeres.');
      } catch (err) {
        setUpsertReceiptSuccess('');
        setUpsertReceiptError(err.message);
      }
      setLoading(false);
    };

    if (isInternetReachable && credentialsAvailable) {
      dispatchReceipts();
    }
  }, [credentialsAvailable, deviceId, dispatch, isInternetReachable, token]);

  if (loading) {
    return <Loading />;
  }

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
          <ErrorCard>{upsertReceiptError}</ErrorCard>
        </View>
      )}
      <Text style={styles.header}>Számla mentése sikeres!</Text>
      <PrintSection partner={currentPartner} receipt={receiptPayload} />
      <View style={styles.buttonContainer}>
        <Button
          variant="ok"
          onPress={() => {
            navigation.goBack();
          }}
        >
          Visszatérés a kezdőképernyőre
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
  textCardContainer: {
    marginBottom: 30,
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
