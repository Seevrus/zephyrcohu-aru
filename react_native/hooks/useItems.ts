import { assoc, prop } from 'ramda';
import { useCallback } from 'react';

import { RootState } from '../store';
import { useAppSelector } from '../store/hooks';
import { Item } from '../store/items-slice/items-slice-types';
import { PriceListItem } from '../store/partners-slice/partners-slice-types';

const useItems = (priceList: Record<number, PriceListItem>) => {
  const selectItems = useCallback(
    (state: RootState) => {
      const mapItemPrice = (item: Item) => {
        const priceListItem = priceList[item.id];
        if (!priceListItem) return item;

        return assoc('netPrice', prop('netPrice', priceListItem), item);
      };

      return state.items.data.map(mapItemPrice);
    },
    [priceList]
  );

  return useAppSelector(selectItems);
};

export default useItems;
