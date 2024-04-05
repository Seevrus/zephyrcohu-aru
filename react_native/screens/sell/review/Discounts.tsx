import { format } from 'date-fns';
import { Suspense } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Container } from '../../../components/container/Container';
import { ErrorCard } from '../../../components/info-cards/ErrorCard';
import { Loading } from '../../../components/Loading';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LabeledItem } from '../../../components/ui/LabeledItem';
import { colors } from '../../../constants/colors';
import { fontSizes } from '../../../constants/fontSizes';
import { type DiscountsProps } from '../../../navigators/screen-types';
import { useDiscountsData } from './useDiscountsData';

function SuspendedDiscounts({ navigation, route }: DiscountsProps) {
  const item = route.params.item;

  const {
    isLoading,
    formError,
    formErrorMessage,
    absoluteDiscount,
    absoluteDiscountedQuantity,
    setAbsoluteDiscountedQuantity,
    percentageDiscount,
    percentageDiscountedQuantity,
    setPercentageDiscountedQuantity,
    freeFormDiscount,
    freeFormDiscountedQuantity,
    setFreeFormDiscountedQuantity,
    freeFormPrice,
    setFreeFormPrice,
    handleApplyDiscounts,
  } = useDiscountsData({
    navigation,
    item,
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>
          {item.name} ({format(new Date(item.expiresAt), 'yyyy-MM')})
        </Text>
      </View>
      {formErrorMessage ? (
        <View style={styles.errorContainer}>
          <ErrorCard>{formErrorMessage}</ErrorCard>
        </View>
      ) : null}
      <View style={styles.firstInfoGroup}>
        <LabeledItem
          label="Mennyiség"
          text={`${item.quantity} ${item.unitName}`}
        />
        <Text style={styles.infoLabel}>Elérhető kedvezmények:</Text>
      </View>
      {absoluteDiscount ? (
        <View style={styles.infoGroup}>
          <LabeledItem label="Típus" text="abszolút" />
          <LabeledItem label="Név" text={absoluteDiscount.name} />
          <View style={styles.inputContainer}>
            <Input
              label="Mennyiség:"
              value={absoluteDiscountedQuantity}
              invalid={formError.absoluteDiscountedQuantity}
              config={{
                autoCorrect: false,
                keyboardType: 'numeric',
                onChangeText: setAbsoluteDiscountedQuantity,
              }}
            />
          </View>
        </View>
      ) : null}
      {percentageDiscount ? (
        <View style={styles.infoGroup}>
          <LabeledItem label="Típus" text="százalékos" />
          <LabeledItem label="Név" text={percentageDiscount.name} />
          <View style={styles.inputContainer}>
            <Input
              label="Mennyiség:"
              value={percentageDiscountedQuantity}
              invalid={formError.percentageDiscountedQuantity}
              config={{
                autoCorrect: false,
                keyboardType: 'numeric',
                onChangeText: setPercentageDiscountedQuantity,
              }}
            />
          </View>
        </View>
      ) : null}
      {freeFormDiscount ? (
        <View style={styles.infoGroup}>
          <LabeledItem label="Típus" text="tetszőleges" />
          <LabeledItem label="Név" text={freeFormDiscount.name} />
          <View style={styles.inputContainer}>
            <Input
              label="Mennyiség:"
              value={freeFormDiscountedQuantity}
              invalid={formError.freeFormDiscountedQuantity}
              config={{
                autoCorrect: false,
                keyboardType: 'numeric',
                onChangeText: setFreeFormDiscountedQuantity,
              }}
            />
          </View>
          <View style={styles.inputContainer}>
            <Input
              label="Ár:"
              value={freeFormPrice}
              invalid={formError.freeFormPrice}
              config={{
                autoCorrect: false,
                keyboardType: 'numeric',
                onChangeText: setFreeFormPrice,
              }}
            />
          </View>
        </View>
      ) : null}
      <View style={styles.infoGroup}>
        <View style={styles.buttonContainer}>
          <Button variant="ok" onPress={handleApplyDiscounts}>
            Kedvezmények érvényesítése
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

export function Discounts(props: DiscountsProps) {
  return (
    <Suspense fallback={<Container />}>
      <SuspendedDiscounts {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
    width: '90%',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    width: '90%',
  },
  firstInfoGroup: {
    marginHorizontal: '7%',
    marginTop: 10,
  },
  header: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  infoGroup: {
    borderTopColor: colors.white,
    borderTopWidth: 1,
    marginHorizontal: '7%',
    marginTop: 10,
    paddingTop: 5,
  },
  infoLabel: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.input,
    fontWeight: '700',
    marginRight: 5,
  },
  inputContainer: {
    height: 90,
  },
});
