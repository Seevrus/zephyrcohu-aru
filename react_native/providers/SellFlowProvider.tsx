import { PropsWithChildren, createContext, useCallback, useContext, useMemo } from 'react';

import { useReceiptsContext } from './ReceiptsProvider';
import useSelectItems, { UseSelectItems } from './sell-flow-hooks/useSelectItems';
import useSelectPartners, { UseSelectPartners } from './sell-flow-hooks/useSelectPartners';

type SellFlowContextType = Omit<UseSelectPartners, 'currentPriceList' | 'resetUseSelectPartners'> &
  Omit<UseSelectItems, 'resetUseSelectItems'> & {
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

  const resetSellFlowContext = useCallback(async () => {
    resetUseSelectPartners();
    resetUseSelectItems();
    await resetCurrentReceipt();
  }, [resetCurrentReceipt, resetUseSelectItems, resetUseSelectPartners]);

  const sellFlowContextValue = useMemo(
    () => ({
      isLoading: isUseSelectPartnersDataLoading || isUseSelectItemsDataLoading,
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
      resetSellFlowContext,
    }),
    [
      barCode,
      isPartnerChosenForCurrentReceipt,
      isSelectedPartnerOnCurrentPartnerList,
      isUseSelectItemsDataLoading,
      isUseSelectPartnersDataLoading,
      items,
      partners,
      resetSellFlowContext,
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
