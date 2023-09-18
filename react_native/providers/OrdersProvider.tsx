import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

type OrdersContextType = {
  orders: unknown[];
  numberOfOrders: number;
};

const OrdersContext = createContext<OrdersContextType>({} as OrdersContextType);
const ordersContextStorageKey = 'boreal-orders-context';

export default function OrdersProvider({ children }: PropsWithChildren) {
  const [orders, setOrders] = useState<unknown[]>([]);
  const numberOfOrders = orders.length;

  /**
   * Initialize from local storage
   */
  useEffect(() => {
    async function setOrdersFromLocalStorage() {
      const jsonData = await AsyncStorage.getItem(ordersContextStorageKey);
      const localStorageOrders = jsonData ? JSON.parse(jsonData) : [];
      setOrders(localStorageOrders);
    }

    setOrdersFromLocalStorage();
  }, []);

  const ordersContextValue = useMemo(() => ({ orders, numberOfOrders }), [numberOfOrders, orders]);

  return <OrdersContext.Provider value={ordersContextValue}>{children}</OrdersContext.Provider>;
}

export function useOrdersContext() {
  const ordersContext = useContext(OrdersContext);

  if (ordersContext === undefined) {
    throw new Error('useUserContext must be used within OrdersProvider.');
  }

  return ordersContext;
}
