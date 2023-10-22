import { PropsWithChildren, createContext, useCallback, useContext, useMemo } from 'react';

import { useReceiptsContext } from './ReceiptsProvider';
import useReview, { UseReview } from './sell-flow-hooks/useReview';
import useSelectItems, { UseSelectItems } from './sell-flow-hooks/useSelectItems';
import useSelectPartners, { UseSelectPartners } from './sell-flow-hooks/useSelectPartners';

type SellFlowContextType = Omit<UseSelectPartners, 'currentPriceList' | 'resetUseSelectPartners'> &
  Omit<UseSelectItems, 'resetUseSelectItems'> &
  Omit<UseReview, 'resetUseReview'> & {
    isLoading: boolean;
    resetSellFlowContext: () => Promise<void>;
  };

const SellFlowContext = createContext<SellFlowContextType>({} as SellFlowContextType);

export default function SellFlowProvider({ children }: PropsWithChildren) {
  const { resetCurrentReceipt } = useReceiptsContext();
  const {
    isLoading: isUseSelectPartnersDataLoading,
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
    isLoading: isUseSelectItemsDataLoading,
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
    resetUseSelectItems,
  } = useSelectItems({
    currentPriceList,
  });
  const {
    isLoading: isReviewDataLoading,
    reviewItems,
    saveDiscountedItemsInFlow,
    resetUseReview,
  } = useReview({ currentPriceList, selectedItems });

  const resetSellFlowContext = useCallback(async () => {
    resetUseSelectPartners();
    resetUseSelectItems();
    resetUseReview();
    await resetCurrentReceipt();
  }, [resetCurrentReceipt, resetUseReview, resetUseSelectItems, resetUseSelectPartners]);

  const sellFlowContextValue = useMemo(
    () => ({
      isLoading:
        isUseSelectPartnersDataLoading || isUseSelectItemsDataLoading || isReviewDataLoading, // ok
      partners,
      selectedPartner,
      isSelectedPartnerOnCurrentPartnerList, // ok
      isPartnerChosenForCurrentReceipt, // ok
      selectPartner,
      saveSelectedPartnerInFlow,
      saveNewPartnerInFlow, // ok
      items,
      selectedItems,
      setSelectedItems,
      selectedOrderItems,
      setSelectedOrderItems,
      searchTerm,
      setSearchTerm,
      barCode,
      setBarCode,
      saveSelectedItemsInFlow, // ok
      reviewItems,
      saveDiscountedItemsInFlow, // ok
      resetSellFlowContext,
    }),
    [
      barCode,
      isPartnerChosenForCurrentReceipt,
      isReviewDataLoading,
      isSelectedPartnerOnCurrentPartnerList,
      isUseSelectItemsDataLoading,
      isUseSelectPartnersDataLoading,
      items,
      partners,
      resetSellFlowContext,
      reviewItems,
      saveDiscountedItemsInFlow,
      saveNewPartnerInFlow,
      saveSelectedItemsInFlow,
      saveSelectedPartnerInFlow,
      searchTerm,
      selectPartner,
      selectedItems,
      selectedOrderItems,
      selectedPartner,
      setBarCode,
      setSearchTerm,
      setSelectedItems,
      setSelectedOrderItems,
    ]
  );

  return (
    <SellFlowContext.Provider value={sellFlowContextValue}>{children}</SellFlowContext.Provider>
  );
}

export function useSellFlowContext() {
  const sellFlowContext = useContext(SellFlowContext);

  if (sellFlowContext === undefined) {
    throw new Error('useSellFlowContext must be used within SellFlowProvider.');
  }

  return sellFlowContext;
}
