import { formatCurrency } from 'react-native-format-currency';

export default function formatPrice(amount: number) {
  return formatCurrency({ amount, code: 'HUF' })[0];
}
