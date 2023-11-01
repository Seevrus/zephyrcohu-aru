import { useNetInfo } from '@react-native-community/netinfo';
import { useFocusEffect, type EventArg } from '@react-navigation/native';
import { isEmpty, last, not } from 'ramda';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { usePartners } from '../../../api/queries/usePartners';
import { Loading } from '../../../components/Loading';
import { ErrorCard } from '../../../components/info-cards/ErrorCard';
import { TextCard } from '../../../components/info-cards/TextCard';
import { PrintSection } from '../../../components/print-section/PrintSection';
import { Button } from '../../../components/ui/Button';
import { colors } from '../../../constants/colors';
import { fontSizes } from '../../../constants/fontSizes';
import { type SummaryProps } from '../../../navigators/screen-types';
import { useReceiptsContext } from '../../../providers/ReceiptsProvider';
import { useSellFlowContext } from '../../../providers/SellFlowProvider';

export function Summary({ navigation }: SummaryProps) {
  const { isInternetReachable } = useNetInfo();
  const { isPending: isPartnersPending, data: partners } = usePartners();
  const { isPending: isReceiptsContextPending, receipts } =
    useReceiptsContext();
  const {
    isPending: isSellFlowContextPending,
    selectedOrderItems,
    resetSellFlowContext,
    syncSellFlowWithApi,
  } = useSellFlowContext();

  const currentReceipt = last(receipts);

  const currentPartner = useMemo(
    () => partners?.find((partner) => partner.id === currentReceipt?.buyer?.id),
    [currentReceipt?.buyer?.id, partners]
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const exitSummaryHandler = useCallback(
    async (
      event: EventArg<
        'beforeRemove',
        true,
        {
          action: Readonly<{
            type: string;
            payload?: object;
            source?: string;
            target?: string;
          }>;
        }
      >
    ) => {
      setIsLoading(true);
      event.preventDefault();
      await resetSellFlowContext();
      navigation.dispatch(event.data.action);
    },
    [navigation, resetSellFlowContext]
  );

  useFocusEffect(
    useCallback(() => {
      navigation.addListener('beforeRemove', exitSummaryHandler);

      return () => {
        navigation.removeListener('beforeRemove', exitSummaryHandler);
      };
    }, [exitSummaryHandler, navigation])
  );

  if (
    isLoading ||
    isPartnersPending ||
    isReceiptsContextPending ||
    isSellFlowContextPending
  ) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {isInternetReachable === false && (
        <View style={styles.textCardContainer}>
          <TextCard>
            Internetkapcsolat hiányában a számla még nem került beküldésre.
          </TextCard>
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
      <PrintSection partner={currentPartner} receipt={currentReceipt} />
      <View style={styles.buttonContainer}>
        <Button
          variant="ok"
          onPress={async () => {
            setIsLoading(true);
            navigation.removeListener('beforeRemove', exitSummaryHandler);
            await resetSellFlowContext();
            navigation.pop();
          }}
        >
          Visszatérés a kezdőképernyőre
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: '7%',
    paddingTop: 20,
  },
  header: {
    alignSelf: 'center',
    color: colors.white,
    fontFamily: 'Muli',
    fontSize: fontSizes.subtitle,
    marginBottom: 20,
  },
  textCardContainer: {
    marginBottom: 30,
  },
});
