import { memo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { formatCurrency } from 'react-native-format-currency';

import Button from '../../../components/ui/Button';
import LabeledItem from '../../../components/ui/LabeledItem';

export type ReceiptRowProps = {
  item: {
    id: number;
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
  onRemoveItem: ({ id, expiresAt }: { id: number; expiresAt: string }) => void;
};

function ReceiptRow({
  item: {
    id,
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
  onRemoveItem,
}: ReceiptRowProps) {
  const formatPrice = (amount: number) => formatCurrency({ amount, code: 'HUF' })[0];
  const vatLabel = vatAmount === 0 ? 'ÁFA kulcsa' : 'ÁFA kulcsa és összege';
  const displayedVat = vatAmount === 0 ? `${vatRate}` : `${vatRate}%, ${formatPrice(vatAmount)}`;

  const deleteRowHandler = () => {
    Alert.alert('Tétel törlése', `Biztosan törölni szeretné? ${name}, ${expiresAt}`, [
      { text: 'Mégse' },
      {
        text: 'Biztosan ezt szeretném',
        onPress: () => onRemoveItem({ id, expiresAt }),
      },
    ]);
  };

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
      <View style={styles.buttonContainer}>
        <Button variant="warning" onPress={deleteRowHandler}>
          Tétel törlése
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    borderBottomColor: 'white',
    borderBottomWidth: 1,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 5,
    marginHorizontal: '25%',
  },
});

export default memo(ReceiptRow);
