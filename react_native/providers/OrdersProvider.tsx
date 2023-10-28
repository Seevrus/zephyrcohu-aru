import AsyncStorage from '@react-native-async-storage/async-storage';
import { append, isNil } from 'ramda';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import useCheckToken from '../api/queries/useCheckToken';
import { OrderRequest } from '../api/request-types/CreateOrdersRequestType';

type OrdersContextType = {
  isPending: boolean;
  orders: OrderRequest[];
  numberOfOrders: number;
  saveCurrentOrder: (order: OrderRequest) => Promise<void>;
  resetCurrentOrder: () => Promise<void>;
  finalizeCurrentOrder: () => Promise<void>;
};

const OrdersContext = createContext<OrdersContextType>({} as OrdersContextType);
const ordersContextStorageKey = 'boreal-orders-context';
const currentOrderContextStorageKey = 'boreal-current-order-context';

export default function OrdersProvider({ children }: PropsWithChildren) {
  const { data: user, isPending: isUserPending } = useCheckToken();

  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const numberOfOrders = orders.length;
  const [currentOrder, setCurrentOrder] = useState<Partial<OrderRequest>>(null);

  const isRoundStarted = user?.state === 'R';

  /**
   * Initialize orders from local storage
   */
  useEffect(() => {
    async function setOrdersFromLocalStorage() {
      const jsonData = await AsyncStorage.getItem(ordersContextStorageKey);
      const localStorageOrders = jsonData ? JSON.parse(jsonData) : [];
      setOrders(localStorageOrders);
    }

    setOrdersFromLocalStorage();
  }, []);

  /**
   * Persist orders to local storage
   */
  const persistOrders = useCallback(async (ordersToSave: OrderRequest[]) => {
    await AsyncStorage.setItem(ordersContextStorageKey, JSON.stringify(ordersToSave));
  }, []);

  /**
   * Initialize current order from local storage
   */
  useEffect(() => {
    async function setCurrentOrderFromLocalStorage() {
      const jsonData = await AsyncStorage.getItem(currentOrderContextStorageKey);
      const localStorageCurrentReceipt = jsonData ? JSON.parse(jsonData) : {};
      setCurrentOrder(localStorageCurrentReceipt);
    }

    if (isRoundStarted && isNil(currentOrder)) {
      setCurrentOrderFromLocalStorage();
    }
  }, [currentOrder, isRoundStarted]);

  /**
   * Persist current order to local storage
   */
  const persistCurrentOrder = useCallback(
    async (order?: Partial<OrderRequest>) => {
      await AsyncStorage.setItem(
        currentOrderContextStorageKey,
        JSON.stringify(order ?? currentOrder)
      );
    },
    [currentOrder]
  );

  const resetCurrentOrder = useCallback(async () => {
    await AsyncStorage.removeItem(currentOrderContextStorageKey);
    setCurrentOrder(null);
  }, []);

  const saveCurrentOrder = useCallback(
    async (order: OrderRequest) => {
      await persistCurrentOrder(order);
      setCurrentOrder(order);
    },
    [persistCurrentOrder]
  );

  const finalizeCurrentOrder = useCallback(async () => {
    await persistOrders(append(currentOrder as OrderRequest, orders));
    setOrders(append(currentOrder as OrderRequest));
  }, [currentOrder, orders, persistOrders]);

  const ordersContextValue = useMemo(
    () => ({
      isPending: isUserPending,
      orders,
      numberOfOrders,
      saveCurrentOrder,
      resetCurrentOrder,
      finalizeCurrentOrder,
    }),
    [
      finalizeCurrentOrder,
      isUserPending,
      numberOfOrders,
      orders,
      resetCurrentOrder,
      saveCurrentOrder,
    ]
  );

  return <OrdersContext.Provider value={ordersContextValue}>{children}</OrdersContext.Provider>;
}

export function useOrdersContext() {
  const ordersContext = useContext(OrdersContext);

  if (ordersContext === undefined) {
    throw new Error('useOrdersContext must be used within OrdersProvider.');
  }

  return ordersContext;
}
