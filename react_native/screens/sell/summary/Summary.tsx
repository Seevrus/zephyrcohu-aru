import { useNetInfo } from '@react-native-community/netinfo';
import { isEmpty, not } from 'ramda';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ErrorCard from '../../../components/info-cards/ErrorCard';
import TextCard from '../../../components/info-cards/TextCard';
import Loading from '../../../components/Loading';
import PrintSection from '../../../components/print-section/PrintSection';
import Button from '../../../components/ui/Button';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { SummaryProps } from '../../../navigators/screen-types';
import { useSellFlowContext } from '../../../providers/SellFlowProvider';

export default function Summary({ navigation }: SummaryProps) {
  const { isInternetReachable } = useNetInfo();
  const {
    isPending: isSellFlowContextPending,
    selectedOrderItems,
    resetSellFlowContext,
    syncSellFlowWithApi,
  } = useSellFlowContext();

  const [ordersSuccess, setOrdersSuccess] = useState<string>('');
  const [ordersError, setOrdersError] = useState<string>('');
  const [receiptsSuccess, setReceiptsSuccess] = useState<string>('');
  const [receiptsError, setReceiptsError] = useState<string>('');

  useEffect(() => {
    if (
      isInternetReachable === true &&
      !ordersSuccess &&
      !ordersError &&
      !receiptsSuccess &&
      !receiptsError
    ) {
      syncSellFlowWithApi().then(([ordersResult, receiptsResult]) => {
        if (not(isEmpty(selectedOrderItems))) {
          if (ordersResult.status === 'fulfilled') {
            setOrdersSuccess('Rendelések beküldése sikeres.');
          } else {
            setOrdersError('Rendelések beküldése sikertelen.');
          }
        }

        if (receiptsResult.status === 'fulfilled') {
          setReceiptsSuccess('Sikeres számlaküldés.');
        } else {
          setReceiptsError('Számlák beküldése sikertelen');
        }
      });
    }
  }, [
    isInternetReachable,
    ordersError,
    ordersSuccess,
    receiptsError,
    receiptsSuccess,
    selectedOrderItems,
    syncSellFlowWithApi,
  ]);

  if (isSellFlowContextPending) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {isInternetReachable === false && (
        <View style={styles.textCardContainer}>
          <TextCard>Internetkapcsolat hiányában a számla még nem került beküldésre.</TextCard>
        </View>
      )}
      {!!ordersSuccess && (
        <View style={styles.textCardContainer}>
          <TextCard>{ordersSuccess}</TextCard>
        </View>
      )}
      {!!ordersError && (
        <View style={styles.textCardContainer}>
          <ErrorCard>{ordersError}</ErrorCard>
        </View>
      )}
      {!!receiptsSuccess && (
        <View style={styles.textCardContainer}>
          <TextCard>{receiptsSuccess}</TextCard>
        </View>
      )}
      {!!receiptsError && (
        <View style={styles.textCardContainer}>
          <ErrorCard>{receiptsError}</ErrorCard>
        </View>
      )}
      <Text style={styles.header}>Számla mentése sikeres!</Text>
      <PrintSection />
      <View style={styles.buttonContainer}>
        <Button
          variant="ok"
          onPress={async () => {
            await resetSellFlowContext();
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
