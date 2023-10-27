import { sort } from 'ramda';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useActiveRound from '../../api/queries/useActiveRound';
import usePartnerLists from '../../api/queries/usePartnerLists';
import usePartners from '../../api/queries/usePartners';
import usePriceLists from '../../api/queries/usePriceLists';
import { Partners } from '../../api/response-mappers/mapPartnersResponse';
import { TaxPayer } from '../../api/response-mappers/mapSearchTaxPayerResponse';
import { PriceListType } from '../../api/response-types/PriceListResponseType';
import { PartnerList } from '../../navigators/screen-types';
import { useReceiptsContext } from '../ReceiptsProvider';

export type UseSelectPartners = {
  isPending: boolean;
  partners: Record<PartnerList, Partners>;
  selectedPartner: Partners[number];
  isSelectedPartnerOnCurrentPartnerList: boolean;
  isPartnerChosenForCurrentReceipt: boolean;
  selectPartner: (id: number) => void;
  saveSelectedPartnerInFlow: () => Promise<void>;
  saveNewPartnerInFlow: (newPartner: TaxPayer) => Promise<void>;
  currentPriceList: PriceListType;
  resetUseSelectPartners: () => void;
};

export default function useSelectPartners(): UseSelectPartners {
  const { data: activeRound, isPending: isActiveRoundPending } = useActiveRound();
  const { data: partnerLists, isPending: isPartnersListsPending } = usePartnerLists();
  const { data: partners, isPending: isPartnersPending } = usePartners();
  const { data: priceLists, isPending: isPriceListsPending } = usePriceLists();
  const {
    isPending: isReceiptsContextPending,
    currentReceipt,
    setCurrentReceiptBuyer,
  } = useReceiptsContext();

  const isPartnerChosenForCurrentReceipt = !!currentReceipt?.buyer;

  const [selectedPartner, setSelectedPartner] = useState<Partners[number] | null>(null);

  const currentPartnerList = useMemo(
    () => partnerLists?.find((partnerList) => partnerList.id === activeRound?.partnerListId),
    [activeRound?.partnerListId, partnerLists]
  );

  const currentPriceList = useMemo(
    () => priceLists?.find((priceList) => priceList.id === selectedPartner?.priceList?.id),
    [priceLists, selectedPartner?.priceList?.id]
  );

  const isSelectedPartnerOnCurrentPartnerList =
    !currentPartnerList || !selectedPartner
      ? undefined
      : currentPartnerList?.partners?.includes(selectedPartner.id);

  const maxPartnerIdInUse = useRef<number>(-1);

  const selectPartner = useCallback(
    (id: number) => {
      setSelectedPartner(partners?.find((partner) => partner.id === id) ?? null);
    },
    [partners]
  );

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

  const saveSelectedPartnerInFlow = useCallback(async () => {
    await setCurrentReceiptBuyer({
      partnerCode: selectedPartner.code,
      partnerSiteCode: selectedPartner.siteCode,
      buyer: {
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
      },
      paymentDays: selectedPartner.paymentDays,
      invoiceType: selectedPartner.invoiceType,
    });
  }, [
    selectedPartner?.bankAccount,
    selectedPartner?.code,
    selectedPartner?.iban,
    selectedPartner?.id,
    selectedPartner?.invoiceType,
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
    selectedPartner?.paymentDays,
    selectedPartner?.siteCode,
    selectedPartner?.vatNumber,
    setCurrentReceiptBuyer,
  ]);

  const saveNewPartnerInFlow = useCallback(
    async (newPartner: TaxPayer) => {
      const newPartnerId = maxPartnerIdInUse.current + 1;
      maxPartnerIdInUse.current = newPartnerId;

      await setCurrentReceiptBuyer({
        partnerCode: '',
        partnerSiteCode: '',
        buyer: {
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
        },
        paymentDays: 0,
        invoiceType: 'P',
      });
    },
    [setCurrentReceiptBuyer]
  );

  const resetUseSelectPartners = useCallback(() => {
    setSelectedPartner(null);
    maxPartnerIdInUse.current = -1;
  }, []);

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

  return useMemo(
    () => ({
      isPending:
        isActiveRoundPending ||
        isPartnersListsPending ||
        isPartnersPending ||
        isPriceListsPending ||
        isReceiptsContextPending,
      partners: partnersToShow,
      selectedPartner,
      isSelectedPartnerOnCurrentPartnerList,
      isPartnerChosenForCurrentReceipt,
      selectPartner,
      saveSelectedPartnerInFlow,
      saveNewPartnerInFlow,
      currentPriceList,
      resetUseSelectPartners,
    }),
    [
      currentPriceList,
      isActiveRoundPending,
      isPartnerChosenForCurrentReceipt,
      isPartnersListsPending,
      isPartnersPending,
      isPriceListsPending,
      isReceiptsContextPending,
      isSelectedPartnerOnCurrentPartnerList,
      partnersToShow,
      resetUseSelectPartners,
      saveNewPartnerInFlow,
      saveSelectedPartnerInFlow,
      selectPartner,
      selectedPartner,
    ]
  );
}
