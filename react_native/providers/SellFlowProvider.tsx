import { PropsWithChildren, createContext, useContext, useMemo } from 'react';

import useActiveRound from '../api/queries/useActiveRound';
import usePartnerLists from '../api/queries/usePartnerLists';
import usePartners from '../api/queries/usePartners';
import { Partners } from '../api/response-mappers/mapPartnersResponse';
import { PartnerList } from '../screens/screen-types';

type SellFlowContextType = {
  isLoading: boolean;
  partners: Record<PartnerList, Partners>;
};

const SellFlowContext = createContext<SellFlowContextType>({} as SellFlowContextType);

export default function SellFlowProvider({ children }: PropsWithChildren) {
  const { data: activeRound, isLoading: isActiveRoundLoading } = useActiveRound();
  const { data: partners, isLoading: isPartnersLoading } = usePartners();
  const { data: partnerLists, isLoading: isPartnersListsLoading } = usePartnerLists();

  const currentPartnerList = useMemo(
    () => partnerLists?.find((partnerList) => partnerList.id === activeRound?.partnerListId),
    [activeRound?.partnerListId, partnerLists]
  );

  const partnersToShow: Record<PartnerList, Partners> = useMemo(() => {
    const sortedPartners = partners?.toSorted((partner1, partner2) =>
      partner1.locations.D.name.localeCompare(partner2.locations.D.name, 'HU-hu')
    );
    const filteredPartners = sortedPartners.filter((partner) =>
      currentPartnerList.partners.includes(partner.id)
    );

    return {
      [PartnerList.ALL]: sortedPartners,
      [PartnerList.STORE]: filteredPartners,
    };
  }, [currentPartnerList.partners, partners]);

  const sellFlowContextValue = useMemo(
    () => ({
      isLoading: isActiveRoundLoading || isPartnersLoading || isPartnersListsLoading,
      partners: partnersToShow,
    }),
    [isActiveRoundLoading, isPartnersListsLoading, isPartnersLoading, partnersToShow]
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
