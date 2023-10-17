import { indexBy, isEmpty, isNil, map, pipe, prop, sort, sortBy } from 'ramda';
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
import useItems from '../api/queries/useItems';
import usePartnerLists from '../api/queries/usePartnerLists';
import usePartners from '../api/queries/usePartners';
import { Partners } from '../api/response-mappers/mapPartnersResponse';
import { TaxPayer } from '../api/response-mappers/mapSearchTaxPayerResponse';
import { Expiration, ItemType } from '../api/response-types/ItemsResponseType';
import { PartnerList } from '../navigators/screen-types';
import { useReceiptsContext } from './ReceiptsProvider';
import { useStorageContext } from './StorageProvider';
import usePriceLists from '../api/queries/usePriceLists';

export type SellExpiration = {
  id: number;
  expiresAt: string;
  quantity: number | undefined;
};

export type SellExpirations = Record<number, SellExpiration>;

export type SellItem = {
  id: number;
  name: string;
  netPrice: number;
  vatRate: string;
  expirations: SellExpirations;
};

export type SellItems = SellItem[];

type SellFlowContextType = {
  isLoading: boolean;
  partners: Record<PartnerList, Partners>;
  selectedPartner: Partners[number];
  isSelectedPartnerOnCurrentPartnerList: boolean;
  isPartnerChosenForCurrentReceipt: boolean;
  selectPartner: (id: number) => void;
  saveSelectedPartnerInFlow: () => Promise<void>;
  saveNewPartnerInFlow: (newPartner: TaxPayer) => Promise<void>;
  items: SellItems;
};

const SellFlowContext = createContext<SellFlowContextType>({} as SellFlowContextType);

export default function SellFlowProvider({ children }: PropsWithChildren) {
  const { data: activeRound, isLoading: isActiveRoundLoading } = useActiveRound();
  const { data: items } = useItems();
  const { data: partners, isLoading: isPartnersLoading } = usePartners();
  const { data: partnerLists, isLoading: isPartnersListsLoading } = usePartnerLists();
  const { data: priceLists, isLoading: isPriceListsLoading } = usePriceLists();
  const { currentReceipt, setCurrentReceiptBuyer } = useReceiptsContext();
  const isPartnerChosenForCurrentReceipt = !!currentReceipt?.buyer;
  const {
    storage,
    originalStorage,
    isLoading: isStorageLoading,
    slowSaveStorageExpirations,
  } = useStorageContext();

  const currentPartnerList = useMemo(
    () => partnerLists?.find((partnerList) => partnerList.id === activeRound?.partnerListId),
    [activeRound?.partnerListId, partnerLists]
  );

  const [selectedPartner, setSelectedPartner] = useState<Partners[number] | null>(null);
  const isSelectedPartnerOnCurrentPartnerList =
    !currentPartnerList || !selectedPartner
      ? undefined
      : currentPartnerList?.partners?.includes(selectedPartner.id);

  const currentPriceList = useMemo(
    () => priceLists?.find((priceList) => priceList.id === selectedPartner?.priceList?.id),
    [priceLists, selectedPartner?.priceList?.id]
  );

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

  const [originalStorageExpirations, setOriginalStorageExpirations] = useState<
    Record<number, Record<number, number>>
  >({});
  const [storageExpirations, setStorageExpirations] = useState<
    Record<number, Record<number, number>>
  >({});

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

  useEffect(() => {
    setOriginalStorageExpirations((prevExpirations) => {
      if (!isEmpty(prevExpirations) || isNil(originalStorage)) return prevExpirations;

      const originalExpirations: Record<number, Record<number, number>> = {};

      originalStorage.expirations.forEach((expiration) => {
        if (!originalExpirations[expiration.itemId]) {
          originalExpirations[expiration.itemId] = {};
        }
        originalExpirations[expiration.itemId][expiration.expirationId] = expiration.quantity;
      });

      return originalExpirations;
    });
  }, [originalStorage]);

  useEffect(() => {
    setStorageExpirations((prevExpirations) => {
      if (!isEmpty(prevExpirations) || isNil(storage)) return prevExpirations;

      const expirations: Record<number, Record<number, number>> = {};

      storage.expirations.forEach((expiration) => {
        if (!expirations[expiration.itemId]) {
          expirations[expiration.itemId] = {};
        }
        expirations[expiration.itemId][expiration.expirationId] = expiration.quantity;
      });

      return expirations;
    });
  }, [storage]);

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

  const sellItems = useMemo(
    () =>
      pipe(
        map<ItemType, SellItem>((item) => ({
          id: item.id,
          name: item.name,
          netPrice:
            currentPriceList?.items.find((i) => i.itemId === item.id)?.netPrice ?? item.netPrice,
          vatRate: item.vatRate,
          expirations: pipe(
            map<Expiration, SellExpiration>((expiration) => ({
              id: expiration.id,
              expiresAt: expiration.expiresAt,
              quantity: storageExpirations[item.id]?.[expiration.id] ?? 0,
            })),
            indexBy(prop('id'))
          )(item.expirations),
        })),
        sortBy(prop('name'))
      )(items ?? []) satisfies SellItems,
    [currentPriceList?.items, items, storageExpirations]
  );

  const sellFlowContextValue = useMemo(
    () => ({
      isLoading:
        isActiveRoundLoading ||
        isPartnersLoading ||
        isPartnersListsLoading ||
        isPriceListsLoading ||
        isStorageLoading,
      partners: partnersToShow,
      selectedPartner,
      isSelectedPartnerOnCurrentPartnerList,
      isPartnerChosenForCurrentReceipt,
      selectPartner,
      saveSelectedPartnerInFlow,
      saveNewPartnerInFlow,
      items: sellItems,
    }),
    [
      isActiveRoundLoading,
      isPartnerChosenForCurrentReceipt,
      isPartnersListsLoading,
      isPartnersLoading,
      isPriceListsLoading,
      isSelectedPartnerOnCurrentPartnerList,
      isStorageLoading,
      partnersToShow,
      saveNewPartnerInFlow,
      saveSelectedPartnerInFlow,
      selectPartner,
      selectedPartner,
      sellItems,
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
