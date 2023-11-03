import AsyncStorage from '@react-native-async-storage/async-storage';
import { append, assoc, isNil } from 'ramda';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { useCreateOrders } from '../api/mutations/useCreateOrders';
import { useCheckToken } from '../api/queries/checkTokenAtom';
import { type OrderRequest } from '../api/request-types/CreateOrdersRequestType';
import { type CreateOrdersResponseData } from '../api/response-types/CreateOrdersResponseType';
import { type ContextOrder } from './types/orders-provider-types';

type OrdersContextType = {
  isPending: boolean;
  orders: ContextOrder[];
  numberOfOrders: number;
  saveCurrentOrder: (order: ContextOrder) => Promise<void>;
  resetCurrentOrder: () => Promise<void>;
  finalizeCurrentOrder: () => Promise<void>;
  sendInOrders: () => Promise<CreateOrdersResponseData>;
  resetOrdersContext: () => Promise<void>;
};

const OrdersContext = createContext<OrdersContextType>({} as OrdersContextType);
const ordersContextStorageKey = 'boreal-orders-context';
const currentOrderContextStorageKey = 'boreal-current-order-context';

export function OrdersProvider({ children }: PropsWithChildren) {
  const { data: user, isPending: isUserPending } = useCheckToken();
  const { isPending: isCreateOrdersPending, mutateAsync: createOrdersAPI } =
    useCreateOrders();

  const [orders, setOrders] = useState<ContextOrder[]>([]);
  const numberOfOrders = orders.length;
  const [currentOrder, setCurrentOrder] = useState<ContextOrder>(null);
  const [isOrdersSyncInProgress, setIsOrdersSyncInProgress] = useState<boolean>(
    isCreateOrdersPending
  );

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
  const persistOrders = useCallback(async (ordersToSave: ContextOrder[]) => {
    await AsyncStorage.setItem(
      ordersContextStorageKey,
      JSON.stringify(ordersToSave)
    );
  }, []);

  const resetOrders = useCallback(async () => {
    await AsyncStorage.removeItem(ordersContextStorageKey);
    setOrders([]);
  }, []);

  /**
   * Initialize current order from local storage
   */
  useEffect(() => {
    async function setCurrentOrderFromLocalStorage() {
      const jsonData = await AsyncStorage.getItem(
        currentOrderContextStorageKey
      );
      const localStorageCurrentOrder = jsonData ? JSON.parse(jsonData) : {};
      setCurrentOrder(localStorageCurrentOrder);
    }

    if (isRoundStarted && isNil(currentOrder)) {
      setCurrentOrderFromLocalStorage();
    }
  }, [currentOrder, isRoundStarted]);

  /**
   * Persist current order to local storage
   */
  const persistCurrentOrder = useCallback(
    async (order?: ContextOrder) => {
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
      const contextOrder: ContextOrder = assoc('isSent', false, order);

      await persistCurrentOrder(contextOrder);
      setCurrentOrder(contextOrder);
    },
    [persistCurrentOrder]
  );

  const finalizeCurrentOrder = useCallback(async () => {
    if (currentOrder.items.length > 0) {
      await persistOrders(append(currentOrder, orders));
      setOrders(append(currentOrder));
    }
  }, [currentOrder, orders, persistOrders]);

  const sendInOrders = useCallback(async () => {
    if (!isOrdersSyncInProgress && orders.some((o) => !o.isSent)) {
      setIsOrdersSyncInProgress(true);

      const ordersApiResult = await createOrdersAPI(orders);
      const updatedOrders = orders.map<ContextOrder>(assoc('isSent', true));
      await persistOrders(updatedOrders);
      setOrders(updatedOrders);

      setIsOrdersSyncInProgress(false);
      return ordersApiResult;
    }
  }, [createOrdersAPI, isOrdersSyncInProgress, orders, persistOrders]);

  const resetOrdersContext = useCallback(async () => {
    await resetCurrentOrder();
    await resetOrders();
  }, [resetCurrentOrder, resetOrders]);

  const ordersContextValue = useMemo(
    () => ({
      isPending: isUserPending,
      orders,
      numberOfOrders,
      saveCurrentOrder,
      resetCurrentOrder,
      finalizeCurrentOrder,
      sendInOrders,
      resetOrdersContext,
    }),
    [
      finalizeCurrentOrder,
      isUserPending,
      numberOfOrders,
      orders,
      resetCurrentOrder,
      resetOrdersContext,
      saveCurrentOrder,
      sendInOrders,
    ]
  );

  return (
    <OrdersContext.Provider value={ordersContextValue}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrdersContext() {
  const ordersContext = useContext(OrdersContext);

  if (ordersContext === undefined) {
    throw new Error('useOrdersContext must be used within OrdersProvider.');
  }

  return ordersContext;
}
