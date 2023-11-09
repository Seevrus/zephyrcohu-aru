import { defaultTo } from 'ramda';

export function calculateAmounts({
  netPrice,
  quantity,
  vatRate,
}: {
  netPrice: number;
  quantity: number;
  vatRate: string;
}) {
  const netAmount = netPrice * quantity;
  const vatRateNumeric = defaultTo(0, +vatRate);
  const vatAmount = Math.round(netAmount * (vatRateNumeric / 100));

  return {
    netAmount,
    vatAmount,
    grossAmount: netAmount + vatAmount,
  };
}
