import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';

import { useOrdersContext } from './OrdersProvider';
import { useReceiptsContext } from './ReceiptsProvider';
import { useReview, type UseReview } from './sell-flow-hooks/useReview';
import {
  useSelectItems,
  type UseSelectItems,
} from './sell-flow-hooks/useSelectItems';
import {
  useSelectOtherItems,
  type UseSelectOtherItems,
} from './sell-flow-hooks/useSelectOtherItems';
import {
  useSelectPartners,
  type UseSelectPartners,
} from './sell-flow-hooks/useSelectPartners';
import { useSummary, type UseSummary } from './sell-flow-hooks/useSummary';

type SellFlowContextType = Omit<
  UseSelectPartners,
  'currentPriceList' | 'resetUseSelectPartners'
> &
  Omit<UseSelectItems, 'resetUseSelectItems'> &
  Omit<UseSelectOtherItems, 'resetUseSelectOtherItems'> &
  Omit<UseReview, 'resetUseReview'> &
  UseSummary & {
    isPending: boolean;
    resetSellFlowContext: () => Promise<void>;
  };

const SellFlowContext = createContext<SellFlowContextType>(
  {} as SellFlowContextType
);

export function SellFlowProvider({ children }: PropsWithChildren) {
  const { isPending: isOrdersContextPending, resetCurrentOrder } =
    useOrdersContext();
  const { isPending: isReceiptsContextPending, resetCurrentReceipt } =
    useReceiptsContext();
  const {
    isPending: isUseSelectPartnersDataPending,
    partners,
    selectedPartner,
    isSelectedPartnerOnCurrentPartnerList,
    isPartnerChosenForCurrentReceipt,
    selectPartner,
    saveSelectedPartnerInFlow,
    saveNewPartnerInFlow,
    currentPriceList,
    resetUseSelectPartners,
  } = useSelectPartners();
  const {
    isPending: isUseSelectItemsDataPending,
    items,
    selectedItems,
    setSelectedItems,
    selectedOrderItems,
    setSelectedOrderItems,
    searchTerm,
    setSearchTerm,
    barCode,
    setBarCode,
    saveSelectedItemsInFlow,
    saveSelectedOrderItemsInFlow,
    resetUseSelectItems,
  } = useSelectItems({
    selectedPartner,
    currentPriceList,
  });
  const {
    isPending: isUseSelectOtherItemsDataPending,
    otherItems,
    selectedOtherItems,
    setSelectedOtherItems,
    saveSelectedOtherItemsInFlow,
    resetUseSelectOtherItems,
  } = useSelectOtherItems();
  const {
    isPending: isReviewDataPending,
    reviewItems,
    saveDiscountedItemsInFlow,
    resetUseReview,
    finishReview,
  } = useReview({ currentPriceList, selectedItems, selectedOtherItems });
  const { isPending: isSummarydataPending, syncSellFlowWithApi } = useSummary();

  const resetSellFlowContext = useCallback(async () => {
    resetUseSelectPartners();
    resetUseSelectItems();
    resetUseSelectOtherItems();
    resetUseReview();
    await resetCurrentOrder();
    await resetCurrentReceipt();
  }, [
    resetCurrentOrder,
    resetCurrentReceipt,
    resetUseReview,
    resetUseSelectItems,
    resetUseSelectOtherItems,
    resetUseSelectPartners,
  ]);

  const sellFlowContextValue = useMemo(
    () => ({
      isPending:
        isOrdersContextPending ||
        isReceiptsContextPending ||
        isUseSelectPartnersDataPending ||
        isUseSelectItemsDataPending ||
        isUseSelectOtherItemsDataPending ||
        isReviewDataPending ||
        isSummarydataPending,
      partners,
      selectedPartner,
      isSelectedPartnerOnCurrentPartnerList,
      isPartnerChosenForCurrentReceipt,
      selectPartner,
      saveSelectedPartnerInFlow,
      saveNewPartnerInFlow,
      items,
      selectedItems,
      setSelectedItems,
      selectedOrderItems,
      setSelectedOrderItems,
      searchTerm,
      setSearchTerm,
      barCode,
      setBarCode,
      saveSelectedItemsInFlow,
      saveSelectedOrderItemsInFlow,
      otherItems,
      selectedOtherItems,
      setSelectedOtherItems,
      saveSelectedOtherItemsInFlow,
      reviewItems,
      saveDiscountedItemsInFlow,
      finishReview,
      resetSellFlowContext,
      syncSellFlowWithApi,
    }),
    [
      barCode,
      finishReview,
      isOrdersContextPending,
      isPartnerChosenForCurrentReceipt,
      isReceiptsContextPending,
      isReviewDataPending,
      isSelectedPartnerOnCurrentPartnerList,
      isSummarydataPending,
      isUseSelectItemsDataPending,
      isUseSelectOtherItemsDataPending,
      isUseSelectPartnersDataPending,
      items,
      otherItems,
      partners,
      resetSellFlowContext,
      reviewItems,
      saveDiscountedItemsInFlow,
      saveNewPartnerInFlow,
      saveSelectedItemsInFlow,
      saveSelectedOrderItemsInFlow,
      saveSelectedOtherItemsInFlow,
      saveSelectedPartnerInFlow,
      searchTerm,
      selectPartner,
      selectedItems,
      selectedOrderItems,
      selectedOtherItems,
      selectedPartner,
      setBarCode,
      setSearchTerm,
      setSelectedItems,
      setSelectedOrderItems,
      setSelectedOtherItems,
      syncSellFlowWithApi,
    ]
  );

  return (
    <SellFlowContext.Provider value={sellFlowContextValue}>
      {children}
    </SellFlowContext.Provider>
  );
}

export function useSellFlowContext() {
  const sellFlowContext = useContext(SellFlowContext);

  if (sellFlowContext === undefined) {
    throw new Error('useSellFlowContext must be used within SellFlowProvider.');
  }

  return sellFlowContext;
}
