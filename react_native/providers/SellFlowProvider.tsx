import { format } from 'date-fns';
import { filter, identity, indexBy, isEmpty, isNil, map, pipe, prop, sort, sortBy } from 'ramda';
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import useActiveRound from '../api/queries/useActiveRound';
import useItems from '../api/queries/useItems';
import usePartnerLists from '../api/queries/usePartnerLists';
import usePartners from '../api/queries/usePartners';
import usePriceLists from '../api/queries/usePriceLists';
import { Partners } from '../api/response-mappers/mapPartnersResponse';
import { TaxPayer } from '../api/response-mappers/mapSearchTaxPayerResponse';
import { Expiration, ItemType } from '../api/response-types/ItemsResponseType';
import itemsSearchReducer, { SearchStateActionKind } from '../hooks/itemsSearchReducer';
import { PartnerList } from '../navigators/screen-types';
import calculateAmounts from '../utils/calculateAmounts';
import { useReceiptsContext } from './ReceiptsProvider';
import { useStorageContext } from './StorageProvider';

export type SellExpiration = {
  id: number;
  expiresAt: string;
  quantity: number | undefined;
};

export type SellExpirations = Record<number, SellExpiration>;

export type SellItem = {
  id: number;
  name: string;
  articleNumber: string;
  unitName: string;
  barcodes: string[];
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
  selectedItems: Record<number, Record<number, number>>;
  setSelectedItems: Dispatch<SetStateAction<Record<number, Record<number, number>>>>;
  selectedOrderItems: Record<number, number>;
  setSelectedOrderItems: Dispatch<SetStateAction<Record<number, number>>>;
  searchTerm: string;
  setSearchTerm: (payload: string) => void;
  barCode: string;
  setBarCode: (payload: string) => void;
  saveSelectedItemsInFlow: () => Promise<void>;
  resetSellFlowContext: () => Promise<void>;
};

const SellFlowContext = createContext<SellFlowContextType>({} as SellFlowContextType);

export default function SellFlowProvider({ children }: PropsWithChildren) {
  const { data: activeRound, isLoading: isActiveRoundLoading } = useActiveRound();
  const { data: items } = useItems();
  const { data: partners, isLoading: isPartnersLoading } = usePartners();
  const { data: partnerLists, isLoading: isPartnersListsLoading } = usePartnerLists();
  const { data: priceLists, isLoading: isPriceListsLoading } = usePriceLists();
  const { currentReceipt, resetCurrentReceipt, setCurrentReceiptBuyer, setCurrentReceiptItems } =
    useReceiptsContext();
  const isPartnerChosenForCurrentReceipt = !!currentReceipt?.buyer;
  const { storage, isLoading: isStorageLoading } = useStorageContext();

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

  const [storageExpirations, setStorageExpirations] = useState<
    Record<number, Record<number, number>>
  >({});

  const [selectedItems, setSelectedItems] = useState<Record<number, Record<number, number>>>({});
  const [selectedOrderItems, setSelectedOrderItems] = useState<Record<number, number>>({});

  const [searchState, dispatchSearchState] = useReducer(itemsSearchReducer, {
    searchTerm: '',
    barCode: '',
  });

  const { searchTerm, barCode } = searchState;

  const setSearchTerm = useCallback(
    (payload: string) =>
      dispatchSearchState({ type: SearchStateActionKind.SetSearchTerm, payload }),
    []
  );
  const setBarCode = useCallback(
    (payload: string) => dispatchSearchState({ type: SearchStateActionKind.SetBarCode, payload }),
    []
  );

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
          articleNumber: item.articleNumber,
          unitName: item.unitName,
          barcodes: item.expirations.map((expiration) => `${item.barcode}${expiration.barcode}`),
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
        filter<SellItem>(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            item.barcodes.some((bc) => bc.includes(barCode))
        ),
        sortBy(prop('name'))
      )(items ?? []) satisfies SellItems,
    [barCode, currentPriceList?.items, items, searchTerm, storageExpirations]
  );

  const saveSelectedItemsInFlow = useCallback(async () => {
    await setCurrentReceiptItems(
      items
        .flatMap((item) =>
          item.expirations.map((expiration) => {
            const quantity = selectedItems[item.id]?.[expiration.id];

            if (quantity === undefined) return undefined;

            const { netAmount, vatAmount, grossAmount } = calculateAmounts({
              netPrice: item.netPrice,
              quantity,
              vatRate: item.vatRate,
            });

            return {
              id: item.id,
              CNCode: item.CNCode,
              articleNumber: item.articleNumber,
              expiresAt: format(new Date(expiration.expiresAt), 'yyyy-MM'),
              name: item.name,
              quantity,
              unitName: item.unitName,
              netPrice: item.netPrice,
              netAmount,
              vatRate: item.vatRate,
              vatAmount,
              grossAmount,
            };
          })
        )
        .filter(identity)
    );
  }, [items, selectedItems, setCurrentReceiptItems]);

  const resetSellFlowContext = useCallback(async () => {
    setSelectedPartner(null);
    maxPartnerIdInUse.current = -1;
    setStorageExpirations({});
    setSelectedItems({});
    setSelectedOrderItems({});
    dispatchSearchState({ type: SearchStateActionKind.ClearSearch, payload: '' });
    await resetCurrentReceipt();
  }, [resetCurrentReceipt]);

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
      isActiveRoundLoading,
      isPartnerChosenForCurrentReceipt,
      isPartnersListsLoading,
      isPartnersLoading,
      isPriceListsLoading,
      isSelectedPartnerOnCurrentPartnerList,
      isStorageLoading,
      partnersToShow,
      resetSellFlowContext,
      saveNewPartnerInFlow,
      saveSelectedItemsInFlow,
      saveSelectedPartnerInFlow,
      searchTerm,
      selectPartner,
      selectedItems,
      selectedOrderItems,
      selectedPartner,
      sellItems,
      setBarCode,
      setSearchTerm,
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
