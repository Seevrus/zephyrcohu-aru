import { PropsWithChildren, createContext, useCallback, useContext, useMemo } from 'react';

import { useReceiptsContext } from './ReceiptsProvider';
import useReview, { UseReview } from './sell-flow-hooks/useReview';
import useSelectItems, { UseSelectItems } from './sell-flow-hooks/useSelectItems';
import useSelectOtherItems, { UseSelectOtherItems } from './sell-flow-hooks/useSelectOtherItems';
import useSelectPartners, { UseSelectPartners } from './sell-flow-hooks/useSelectPartners';

type SellFlowContextType = Omit<UseSelectPartners, 'currentPriceList' | 'resetUseSelectPartners'> &
  Omit<UseSelectItems, 'resetUseSelectItems'> &
  Omit<UseSelectOtherItems, 'resetUseSelectOtherItems'> &
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
    isLoading: isUseSelectOtherItemsDataLoading,
    otherItems,
    selectedOtherItems,
    setSelectedOtherItems,
    saveSelectedOtherItemsInFlow,
    resetUseSelectOtherItems,
  } = useSelectOtherItems();
  const {
    isLoading: isReviewDataLoading,
    reviewItems,
    saveDiscountedItemsInFlow,
    resetUseReview,
  } = useReview({ currentPriceList, selectedItems, selectedOtherItems });

  const resetSellFlowContext = useCallback(async () => {
    resetUseSelectPartners();
    resetUseSelectItems();
    resetUseSelectOtherItems();
    resetUseReview();
    await resetCurrentReceipt();
  }, [
    resetCurrentReceipt,
    resetUseReview,
    resetUseSelectItems,
    resetUseSelectOtherItems,
    resetUseSelectPartners,
  ]);

  const sellFlowContextValue = useMemo(
    () => ({
      isLoading:
        isUseSelectPartnersDataLoading ||
        isUseSelectItemsDataLoading ||
        isUseSelectOtherItemsDataLoading ||
        isReviewDataLoading,
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
      otherItems,
      selectedOtherItems,
      setSelectedOtherItems,
      saveSelectedOtherItemsInFlow,
      reviewItems,
      saveDiscountedItemsInFlow,
      resetSellFlowContext,
    }),
    [
      barCode,
      isPartnerChosenForCurrentReceipt,
      isReviewDataLoading,
      isSelectedPartnerOnCurrentPartnerList,
      isUseSelectItemsDataLoading,
      isUseSelectOtherItemsDataLoading,
      isUseSelectPartnersDataLoading,
      items,
      otherItems,
      partners,
      resetSellFlowContext,
      reviewItems,
      saveDiscountedItemsInFlow,
      saveNewPartnerInFlow,
      saveSelectedItemsInFlow,
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
