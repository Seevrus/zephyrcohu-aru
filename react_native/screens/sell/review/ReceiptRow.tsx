import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { formatCurrency } from 'react-native-format-currency';

import LabeledItem from '../../../components/ui/LabeledItem';

export type ReceiptRowProps = {
  code: string;
  name: string;
  expiresAt: string;
  quantity: number;
  unitName: string;
  netPrice: number;
  netAmount: number;
  vatRate: string;
  vatAmount: number;
  grossAmount: number;
};

function ReceiptRow({
  item: {
    code,
    name,
    expiresAt,
    quantity,
    unitName,
    netPrice,
    netAmount,
    vatRate,
    vatAmount,
    grossAmount,
  },
}: {
  item: ReceiptRowProps;
}) {
  const formatPrice = (amount: number) => formatCurrency({ amount, code: 'HUF' })[0];
  const vatLabel = vatAmount === 0 ? 'ÁFA kulcsa' : 'ÁFA kulcsa és összege';
  const displayedVat = vatAmount === 0 ? `${vatRate}` : `${vatRate}%, ${formatPrice(vatAmount)}`;

  return (
    <View style={styles.container}>
      <LabeledItem label="Sorszám" text={code} />
      <LabeledItem label="Megnevezés" text={name} />
      <LabeledItem label="Lejárat" text={expiresAt} />
      <LabeledItem label="Mennyiség" text={`${quantity} ${unitName}`} />
      <LabeledItem label="Nettó egységár" text={formatPrice(netPrice)} />
      <LabeledItem label="Összeg" text={formatPrice(netAmount)} />
      <LabeledItem label={vatLabel} text={displayedVat} />
      <LabeledItem label="Bruttó összeg" text={formatPrice(grossAmount)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    borderBottomColor: 'white',
    borderBottomWidth: 1,
  },
});

export default memo(ReceiptRow);
