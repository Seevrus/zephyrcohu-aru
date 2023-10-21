import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Input from '../../../components/ui/Input';
import LabeledItem from '../../../components/ui/LabeledItem';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { DiscountsProps } from '../../../navigators/screen-types';

type FormErrors = {
  absoluteDiscountedQuantity: string;
  percentageDiscountedQuantity: string;
  freeFormPrice: string;
  freeFormDiscountedQuantity: string;
};

export default function Discounts({ route }: DiscountsProps) {
  // Tétel megnevezése
  // Mennyiség
  // Elérhető kedvezmények. Első kettőnél csak a databszámot lehet megadni, az utolsónál viszont az eltérített árat is meg kell majd adni
  // Űrlap ellenőrzése, véglegesítése, majd az adatok elmetése a jó ég tudja, hogyan

  const item = route.params?.item;
  const absoluteDiscount = item.availableDiscounts.find((d) => d.type === 'absolute');
  const percentageDiscount = item.availableDiscounts.find((d) => d.type === 'percentage');
  const freeFormDiscount = item.availableDiscounts.find((d) => d.type === 'freeForm');

  const [absoluteDiscountedQuantity, setAboluteDiscountedQuantity] = useState<string>('');
  const [percentageDiscountedQuantity, setPercentageDiscountedQuantity] = useState<string>('');
  const [freeFormPrice, setFreeFormPrice] = useState<string>(String(item.netPrice));
  const [freeFormDiscountedQuantity, setFreeFormDiscountedQuantity] = useState<string>('');

  const [formError, setFormError] = useState<Partial<FormErrors>>({});

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{item.name}</Text>
      </View>
      <View style={styles.firstInfoGroup}>
        <LabeledItem label="Mennyiség" text={`${item.quantity} ${item.unitName}`} />
        <Text style={styles.infoLabel}>Elérhető kedvezmények:</Text>
      </View>
      {absoluteDiscount && (
        <View style={styles.infoGroup}>
          <LabeledItem label="Típus" text="abszolút" />
          <LabeledItem label="Név" text={absoluteDiscount.name} />
          <View style={styles.inputContainer}>
            <Input
              label="Mennyiség:"
              value={absoluteDiscountedQuantity}
              invalid={!!formError.absoluteDiscountedQuantity}
              config={{
                autoCorrect: false,
                keyboardType: 'numeric',
                onChangeText: setAboluteDiscountedQuantity,
              }}
            />
          </View>
        </View>
      )}
      {percentageDiscount && (
        <View style={styles.infoGroup}>
          <LabeledItem label="Típus" text="százalékos" />
          <LabeledItem label="Név" text={percentageDiscount.name} />
          <View style={styles.inputContainer}>
            <Input
              label="Mennyiség:"
              value={percentageDiscountedQuantity}
              invalid={!!formError.percentageDiscountedQuantity}
              config={{
                autoCorrect: false,
                keyboardType: 'numeric',
                onChangeText: setPercentageDiscountedQuantity,
              }}
            />
          </View>
        </View>
      )}
      {freeFormDiscount && (
        <View style={styles.infoGroup}>
          <LabeledItem label="Típus" text="tetszőleges" />
          <LabeledItem label="Név" text={freeFormDiscount.name} />
          <View style={styles.inputContainer}>
            <Input
              label="Ár:"
              value={freeFormPrice}
              invalid={!!formError.freeFormPrice}
              config={{
                autoCorrect: false,
                keyboardType: 'numeric',
                onChangeText: setFreeFormPrice,
              }}
            />
          </View>
          <View style={styles.inputContainer}>
            <Input
              label="Mennyiség:"
              value={freeFormDiscountedQuantity}
              invalid={!!formError.freeFormDiscountedQuantity}
              config={{
                autoCorrect: false,
                keyboardType: 'numeric',
                onChangeText: setFreeFormDiscountedQuantity,
              }}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  header: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  firstInfoGroup: {
    marginTop: 10,
    marginHorizontal: '7%',
  },
  infoGroup: {
    marginTop: 10,
    marginHorizontal: '7%',
    paddingTop: 5,
    borderTopColor: 'white',
    borderTopWidth: 1,
  },
  infoLabel: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.input,
    fontWeight: '700',
    marginRight: 5,
  },
  inputContainer: {
    height: 90,
  },
});
