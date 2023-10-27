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
    isPending: boolean;
    resetSellFlowContext: () => Promise<void>;
  };

const SellFlowContext = createContext<SellFlowContextType>({} as SellFlowContextType);

export default function SellFlowProvider({ children }: PropsWithChildren) {
  const { isPending: isReceiptsContextPending, resetCurrentReceipt } = useReceiptsContext();
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
      isPending:
        isReceiptsContextPending ||
        isUseSelectPartnersDataPending ||
        isUseSelectItemsDataPending ||
        isUseSelectOtherItemsDataPending ||
        isReviewDataPending,
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
      resetSellFlowContext,
    }),
    [
      barCode,
      isPartnerChosenForCurrentReceipt,
      isReceiptsContextPending,
      isReviewDataPending,
      isSelectedPartnerOnCurrentPartnerList,
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
