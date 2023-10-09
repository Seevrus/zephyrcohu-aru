import { useNetInfo } from '@react-native-community/netinfo';
import { last, prop } from 'ramda';
import { StyleSheet, Text, View } from 'react-native';

import { useAppSelector } from '../../../store/hooks';
import { getLastReceiptPayload } from '../../../store/round-slice/round-api-mappers';

import ErrorCard from '../../../components/info-cards/ErrorCard';
import TextCard from '../../../components/info-cards/TextCard';
import Loading from '../../../components/Loading';
import PrintSection from '../../../components/print-section/PrintSection';
import Button from '../../../components/ui/Button';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import useUpsertReceipts from '../../../hooks/useUpsertReceipts';
import { SummaryProps } from '../../../navigators/screen-types';

export default function Summary({ navigation }: SummaryProps) {
  const { isInternetReachable } = useNetInfo();

  const currentPartner = useAppSelector((state) =>
    state.partners.partners.find((p) => p.id === prop('partnerId', last(state.round.receipts)))
  );
  const receiptPayload = useAppSelector(getLastReceiptPayload);

  const { loading, upsertReceiptSuccess, upsertReceiptError } = useUpsertReceipts();

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
