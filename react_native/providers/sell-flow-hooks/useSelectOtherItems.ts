import { useState } from 'react';

import useOtherItems from '../../api/queries/useOtherItems';

export type OtherItem = {
  id: number;
  name: string;
  quantity: number;
};

export default function useSelectOtherItems() {
  const { data: otherItems, isLoading: isOtherItemsLoading } = useOtherItems();

  const [selectedOtherItems, setSelectedOtherItems] = useState<Record<number, number>>({});
}
