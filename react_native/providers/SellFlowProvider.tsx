import { sort } from 'ramda';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import useActiveRound from '../api/queries/useActiveRound';
import usePartnerLists from '../api/queries/usePartnerLists';
import usePartners from '../api/queries/usePartners';
import { Partners } from '../api/response-mappers/mapPartnersResponse';
import { TaxPayer } from '../api/response-mappers/mapSearchTaxPayerResponse';
import { PartnerList } from '../navigators/screen-types';
import { useReceiptsContext } from './ReceiptsProvider';

type SellFlowContextType = {
  isLoading: boolean;
  partners: Record<PartnerList, Partners>;
  selectedPartner: Partners[number];
  isSelectedPartnerOnCurrentPartnerList: boolean;
  isPartnerChosenForCurrentReceipt: boolean;
  selectPartner: (id: number) => void;
  saveSelectedPartnerInFlow: () => Promise<void>;
  saveNewPartnerInFlow: (newPartner: TaxPayer) => Promise<void>;
};

const SellFlowContext = createContext<SellFlowContextType>({} as SellFlowContextType);

export default function SellFlowProvider({ children }: PropsWithChildren) {
  const { data: activeRound, isLoading: isActiveRoundLoading } = useActiveRound();
  const { data: partners, isLoading: isPartnersLoading } = usePartners();
  const { data: partnerLists, isLoading: isPartnersListsLoading } = usePartnerLists();
  const { currentReceipt, setCurrentReceiptBuyer } = useReceiptsContext();
  const isPartnerChosenForCurrentReceipt = !!currentReceipt?.buyer;

  const currentPartnerList = useMemo(
    () => partnerLists?.find((partnerList) => partnerList.id === activeRound?.partnerListId),
    [activeRound?.partnerListId, partnerLists]
  );

  const [selectedPartner, setSelectedPartner] = useState<Partners[number] | null>(null);
  const isSelectedPartnerOnCurrentPartnerList =
    !currentPartnerList || !selectedPartner
      ? undefined
      : currentPartnerList?.partners?.includes(selectedPartner.id);

  const maxPartnerIdInUse = useRef<number>(-1);

  const partnersToShow: Record<PartnerList, Partners> = useMemo(() => {
    const sortedPartners = sort(
      (partner1, partner2) =>
        partner1.locations?.D?.name.localeCompare(partner2.locations?.D?.name, 'HU-hu'),
      partners ?? []
    );

    const filteredPartners = sortedPartners?.filter(
      (partner) => currentPartnerList?.partners?.includes(partner.id)
    );

    return {
      [PartnerList.ALL]: sortedPartners,
      [PartnerList.STORE]: filteredPartners,
    };
  }, [currentPartnerList?.partners, partners]);

  useEffect(() => {
    if (!!partners && maxPartnerIdInUse.current === -1) {
      maxPartnerIdInUse.current = partners.reduce(
        (currentMaxId, partner) => (partner.id > currentMaxId ? partner.id : currentMaxId),
        -1
      );
    }
  }, [partners]);

  useEffect(() => {
    if (currentReceipt?.buyer) {
      const buyerId = currentReceipt.buyer?.id;
      setSelectedPartner(partners?.find((partner) => partner.id === buyerId) ?? null);
    }
  }, [currentReceipt?.buyer, partners]);

  const selectPartner = useCallback(
    (id: number) => {
      setSelectedPartner(partners?.find((partner) => partner.id === id) ?? null);
    },
    [partners]
  );

  const saveSelectedPartnerInFlow = useCallback(async () => {
    await setCurrentReceiptBuyer({
      id: selectedPartner.id,
      name: selectedPartner.locations.C?.name ?? selectedPartner.locations.D?.name,
      country: selectedPartner.locations.C?.country ?? selectedPartner.locations.D?.country,
      postalCode:
        selectedPartner.locations.C?.postalCode ?? selectedPartner.locations.D?.postalCode,
      city: selectedPartner.locations.C?.city ?? selectedPartner.locations.D?.city,
      address: selectedPartner.locations.C?.address ?? selectedPartner.locations.D?.address,
      deliveryName: selectedPartner.locations.D?.name,
      deliveryCountry: selectedPartner.locations.D?.country,
      deliveryPostalCode: selectedPartner.locations.D?.postalCode,
      deliveryCity: selectedPartner.locations.D?.city,
      deliveryAddress: selectedPartner.locations.D?.address,
      iban: selectedPartner.iban,
      bankAccount: selectedPartner.bankAccount,
      vatNumber: selectedPartner.vatNumber,
    });
  }, [
    selectedPartner?.bankAccount,
    selectedPartner?.iban,
    selectedPartner?.id,
    selectedPartner?.locations.C?.address,
    selectedPartner?.locations.C?.city,
    selectedPartner?.locations.C?.country,
    selectedPartner?.locations.C?.name,
    selectedPartner?.locations.C?.postalCode,
    selectedPartner?.locations.D?.address,
    selectedPartner?.locations.D?.city,
    selectedPartner?.locations.D?.country,
    selectedPartner?.locations.D?.name,
    selectedPartner?.locations.D?.postalCode,
    selectedPartner?.vatNumber,
    setCurrentReceiptBuyer,
  ]);

  const saveNewPartnerInFlow = useCallback(
    async (newPartner: TaxPayer) => {
      const newPartnerId = maxPartnerIdInUse.current + 1;
      maxPartnerIdInUse.current = newPartnerId;

      await setCurrentReceiptBuyer({
        id: newPartnerId,
        name: newPartner.locations.C?.name ?? newPartner.locations.D.name,
        country: newPartner.locations.C?.country ?? newPartner.locations.D?.country,
        postalCode: newPartner.locations.C?.postalCode ?? newPartner.locations.D?.postalCode,
        city: newPartner.locations.C?.city ?? newPartner.locations.D?.city,
        address: newPartner.locations.C?.address ?? newPartner.locations.D?.address,
        deliveryName: newPartner.locations.D?.name,
        deliveryCountry: newPartner.locations.D?.country,
        deliveryPostalCode: newPartner.locations.D?.postalCode,
        deliveryCity: newPartner.locations.D?.city,
        deliveryAddress: newPartner.locations.D?.address,
        iban: '',
        bankAccount: '',
        vatNumber: newPartner.vatNumber,
      });
    },
    [setCurrentReceiptBuyer]
  );

  const sellFlowContextValue = useMemo(
    () => ({
      isLoading: isActiveRoundLoading || isPartnersLoading || isPartnersListsLoading,
      partners: partnersToShow,
      selectedPartner,
      isSelectedPartnerOnCurrentPartnerList,
      isPartnerChosenForCurrentReceipt,
      selectPartner,
      saveSelectedPartnerInFlow,
      saveNewPartnerInFlow,
    }),
    [
      isActiveRoundLoading,
      isPartnerChosenForCurrentReceipt,
      isPartnersListsLoading,
      isPartnersLoading,
      isSelectedPartnerOnCurrentPartnerList,
      partnersToShow,
      saveNewPartnerInFlow,
      saveSelectedPartnerInFlow,
      selectPartner,
      selectedPartner,
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
