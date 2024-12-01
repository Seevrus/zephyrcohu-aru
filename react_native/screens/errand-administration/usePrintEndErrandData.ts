import { type EventArg, useFocusEffect } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import * as Print from 'expo-print';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';

import { queryKeys } from '../../api/keys';
import { useLogout } from '../../api/mutations/useLogout';
import { useCheckToken } from '../../api/queries/useCheckToken';
import { usePartnerLists } from '../../api/queries/usePartnerLists';
import { useStoreDetails } from '../../api/queries/useStoreDetails';
import { currentOrderAtom, ordersAtom } from '../../atoms/orders';
import { currentReceiptAtom, receiptsAtom } from '../../atoms/receipts';
import { selectedStoreCurrentStateAtom } from '../../atoms/storage';
import { type AlertButton } from '../../components/alert/Alert';
import { useResetSellFlow } from '../../hooks/sell/useResetSellFlow';
import { type StackParams } from '../../navigators/screen-types';
import { createPrintEndErrand } from './createPrintEndErrand';

export function usePrintEndErrandData(
  navigation: NativeStackNavigationProp<
    StackParams,
    'PrintEndErrand',
    undefined
  >
) {
  const queryClient = useQueryClient();
  const { data: user, isPending: isCheckTokenPending } = useCheckToken();
  const { mutateAsync: logout } = useLogout();
  const { data: partnerLists, isPending: isPartnerListsPending } =
    usePartnerLists();
  const { data: storeDetails, isPending: isStoreDetailsPending } =
    useStoreDetails(user?.storeId);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPrinted, setIsPrinted] = useState<boolean>(false);

  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmButton, setConfirmButton] = useState<AlertButton | null>(null);

  const resetAlertHandler = useCallback(() => {
    setIsAlertVisible(false);
    setAlertTitle('');
    setAlertMessage(null);
    setConfirmButton(null);
  }, []);

  const resetSellFlow = useResetSellFlow();

  const [, setCurrentOrder] = useAtom(currentOrderAtom);
  const [, setCurrentReceipt] = useAtom(currentReceiptAtom);
  const [, setOrders] = useAtom(ordersAtom);
  const [receipts, setReceipts] = useAtom(receiptsAtom);
  const [, setSelectedStoreCurrentState] = useAtom(
    selectedStoreCurrentStateAtom
  );

  const isPrintEnabled = !!partnerLists && !!storeDetails && !!user;

  const printButtonHandler = useCallback(async () => {
    if (isPrintEnabled) {
      await Print.printAsync({
        html: createPrintEndErrand({
          partnerLists,
          receipts,
          storeDetails,
          user,
        }),
      });

      setIsPrinted(true);
    }
  }, [isPrintEnabled, partnerLists, receipts, storeDetails, user]);

  const resetHopefullyAfterPrint = useCallback(async () => {
    await setSelectedStoreCurrentState(null);
    await resetSellFlow();
    await setReceipts([]);
    await setCurrentReceipt(null);
    await setOrders([]);
    await setCurrentOrder(null);

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.checkToken }),
      queryClient.invalidateQueries({ queryKey: queryKeys.items }),
      queryClient.invalidateQueries({ queryKey: queryKeys.otherItems }),
      queryClient.invalidateQueries({ queryKey: queryKeys.partnerLists }),
      queryClient.invalidateQueries({ queryKey: queryKeys.partners }),
      queryClient.invalidateQueries({ queryKey: queryKeys.partnerLists }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.searchTaxNumber(),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.storeDetails() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.stores }),
    ]);
  }, [
    queryClient,
    resetSellFlow,
    setCurrentOrder,
    setCurrentReceipt,
    setOrders,
    setReceipts,
    setSelectedStoreCurrentState,
  ]);

  const backButtonHandler = useCallback(
    (
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
      event.preventDefault();

      setIsAlertVisible(true);
      setAlertTitle('Megerősítés szükséges');
      setAlertMessage(
        'Biztosan ki szeretne lépni? A későbbiekben nem lesz lehetőség nyomtatásra!'
      );
      setConfirmButton({
        text: 'Igen',
        variant: 'warning',
        onPress: async () => {
          setIsLoading(true);
          await resetHopefullyAfterPrint();
          await logout();

          navigation.removeListener('beforeRemove', backButtonHandler);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Index' }],
          });
        },
      });
    },
    [logout, navigation, resetHopefullyAfterPrint]
  );

  const exitConfimationHandler = useCallback(async () => {
    setIsLoading(true);
    await resetHopefullyAfterPrint();
    await logout();

    navigation.removeListener('beforeRemove', backButtonHandler);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Index' }],
    });
  }, [backButtonHandler, logout, navigation, resetHopefullyAfterPrint]);

  useFocusEffect(
    useCallback(() => {
      navigation.addListener('beforeRemove', backButtonHandler);

      return () => {
        navigation.removeListener('beforeRemove', backButtonHandler);
      };
    }, [backButtonHandler, navigation])
  );

  return {
    isLoading:
      isLoading ||
      isCheckTokenPending ||
      isPartnerListsPending ||
      isStoreDetailsPending,
    isPrintEnabled,
    isPrinted,
    exitConfimationHandler,
    printButtonHandler,
    alert: {
      isAlertVisible,
      alertTitle,
      alertMessage,
      alertConfirmButton: confirmButton,
      resetAlertHandler,
    },
  };
}
