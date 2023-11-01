import { useNetInfo } from '@react-native-community/netinfo';
import { useFocusEffect, type EventArg } from '@react-navigation/native';
import { last } from 'ramda';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { usePartners } from '../../../api/queries/usePartners';
import { Loading } from '../../../components/Loading';
import { ErrorCard } from '../../../components/info-cards/ErrorCard';
import { TextCard } from '../../../components/info-cards/TextCard';
import { PrintSection } from '../../../components/print-section/PrintSection';
import { Button } from '../../../components/ui/Button';
import { colors } from '../../../constants/colors';
import { fontSizes } from '../../../constants/fontSizes';
import { useSyncSellWithApi } from '../../../hooks/useSyncSellWithApi';
import { type SummaryProps } from '../../../navigators/screen-types';
import { useReceiptsContext } from '../../../providers/ReceiptsProvider';
import { useSellFlowContext } from '../../../providers/SellFlowProvider';

export function Summary({ navigation }: SummaryProps) {
  const { isInternetReachable } = useNetInfo();
  const { isPending: isPartnersPending, data: partners } = usePartners();
  const { isPending: isReceiptsContextPending, receipts } =
    useReceiptsContext();
  const { isPending: isSellFlowContextPending, resetSellFlowContext } =
    useSellFlowContext();

  const currentReceipt = last(receipts);

  const currentPartner = useMemo(
    () => partners?.find((partner) => partner.id === currentReceipt?.buyer?.id),
    [currentReceipt?.buyer?.id, partners]
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    isPending: isSyncSellPending,
    ordersError,
    ordersSuccess,
    receiptsError,
    receiptsSuccess,
  } = useSyncSellWithApi();

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
    isSellFlowContextPending ||
    isSyncSellPending
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
