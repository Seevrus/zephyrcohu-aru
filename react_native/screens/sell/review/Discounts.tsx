import { format } from 'date-fns';
import { useAtom } from 'jotai';
import { assoc, dissoc, isEmpty, isNil, not } from 'ramda';
import { Suspense, useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  currentReceiptAtom,
  type SelectedDiscount,
} from '../../../atoms/receipts';
import { reviewItemsAtom } from '../../../atoms/sellFlow';
import { Loading } from '../../../components/Loading';
import { ErrorCard } from '../../../components/info-cards/ErrorCard';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LabeledItem } from '../../../components/ui/LabeledItem';
import { colors } from '../../../constants/colors';
import { fontSizes } from '../../../constants/fontSizes';
import { type DiscountsProps } from '../../../navigators/screen-types';

type FormErrors = {
  absoluteDiscountedQuantity?: boolean;
  percentageDiscountedQuantity?: boolean;
  freeFormPrice?: boolean;
  freeFormDiscountedQuantity?: boolean;
};

function SuspendedDiscounts({ navigation, route }: DiscountsProps) {
  const [, setCurrentReceipt] = useAtom(currentReceiptAtom);
  const [, setReviewItems] = useAtom(reviewItemsAtom);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const applyDiscounts = useCallback(
    (itemId: number, discounts?: SelectedDiscount[]) => {
      setReviewItems((prevItems) => {
        if (isNil(prevItems)) {
          return prevItems;
        }

        return prevItems.map((item) => {
          if (item.itemId !== itemId || item.type !== 'item') {
            return item;
          }

          if (discounts) {
            return assoc('selectedDiscounts', discounts, item);
          }

          return dissoc('selectedDiscounts', item);
        });
      });
    },
    [setReviewItems]
  );

  const saveDiscountedItemsInFlow = useCallback(
    async (itemId: number, discounts?: SelectedDiscount[]) => {
      applyDiscounts(itemId, discounts);

      setCurrentReceipt(async (prevReceiptPromise) => {
        const prevReceipt = await prevReceiptPromise;

        return {
          ...prevReceipt,
          items: prevReceipt?.items?.map((contextReceiptItem) => {
            if (contextReceiptItem.id !== itemId) {
              return contextReceiptItem;
            }

            if (discounts) {
              return assoc('selectedDiscounts', discounts, contextReceiptItem);
            }

            return dissoc('selectedDiscounts', contextReceiptItem);
          }),
        };
      });
    },
    [applyDiscounts, setCurrentReceipt]
  );

  const item = route.params?.item;
  const absoluteDiscount = item.availableDiscounts?.find(
    (d) => d.type === 'absolute'
  );
  const percentageDiscount = item.availableDiscounts?.find(
    (d) => d.type === 'percentage'
  );
  const freeFormDiscount = item.availableDiscounts?.find(
    (d) => d.type === 'freeForm'
  );

  const currentAbsoluteDiscount = item.selectedDiscounts?.find(
    (d) => d.type === 'absolute'
  );
  const currentPercentageDiscount = item.selectedDiscounts?.find(
    (d) => d.type === 'percentage'
  );
  const currentFreeFormDiscount = item.selectedDiscounts?.find(
    (d) => d.type === 'freeForm'
  );

  const [absoluteDiscountedQuantity, setAboluteDiscountedQuantity] =
    useState<string>(String(currentAbsoluteDiscount?.quantity ?? ''));
  const [percentageDiscountedQuantity, setPercentageDiscountedQuantity] =
    useState<string>(String(currentPercentageDiscount?.quantity ?? ''));
  const [freeFormPrice, setFreeFormPrice] = useState<string>(
    String(currentFreeFormDiscount?.price ?? item.netPrice)
  );
  const [freeFormDiscountedQuantity, setFreeFormDiscountedQuantity] =
    useState<string>(String(currentFreeFormDiscount?.quantity ?? ''));

  const [formError, setFormError] = useState<FormErrors>({});
  const [formErrorMessage, setFormErrorMessage] = useState<string>('');

  const handleApplyDiscounts = async () => {
    setFormError({});
    setFormErrorMessage('');

    let errorMessage = '';
    const formErrors: FormErrors = {};

    const absolute = Number(absoluteDiscountedQuantity) ?? 0;
    const percentage = Number(percentageDiscountedQuantity) ?? 0;
    const freeForm = Number(freeFormDiscountedQuantity) ?? 0;
    const price = Number(freeFormPrice) ?? 0;

    if (absolute + percentage + freeForm > item.quantity) {
      errorMessage += ' Túl nagy megadott mennyiség.';
      formErrors.absoluteDiscountedQuantity = true;
      formErrors.percentageDiscountedQuantity = true;
      formErrors.freeFormDiscountedQuantity = true;
    }
    if (freeForm > 0 && price < 1) {
      errorMessage += ' A megadott ár túl alacsony.';
      formErrors.freeFormPrice = true;
    }

    if (errorMessage) {
      setFormErrorMessage(errorMessage);
    }
    if (not(isEmpty(formErrors))) {
      setFormError(formErrors);
    }

    if (!errorMessage && isEmpty(formErrors)) {
      setIsLoading(true);

      await (absolute + percentage + freeForm === 0
        ? saveDiscountedItemsInFlow(item.itemId)
        : saveDiscountedItemsInFlow(item.itemId, [
            ...(absolute > 0 && absoluteDiscount
              ? [
                  {
                    id: absoluteDiscount.id,
                    name: absoluteDiscount.name,
                    quantity: absolute,
                    amount: absoluteDiscount.amount,
                    type: 'absolute',
                  } as const,
                ]
              : []),
            ...(percentage > 0 && percentageDiscount
              ? [
                  {
                    id: percentageDiscount.id,
                    name: percentageDiscount.name,
                    quantity: percentage,
                    amount: percentageDiscount.amount,
                    type: 'percentage',
                  } as const,
                ]
              : []),
            ...(freeForm > 0 && freeFormDiscount
              ? [
                  {
                    id: freeFormDiscount.id,
                    name: freeFormDiscount.name,
                    quantity: freeForm,
                    price,
                    type: 'freeForm',
                  } as const,
                ]
              : []),
          ]));

      setIsLoading(false);
      navigation.goBack();
    }
  };

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
      {formErrorMessage && (
        <View style={styles.errorContainer}>
          <ErrorCard>{formErrorMessage}</ErrorCard>
        </View>
      )}
      <View style={styles.firstInfoGroup}>
        <LabeledItem
          label="Mennyiség"
          text={`${item.quantity} ${item.unitName}`}
        />
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
              invalid={formError.absoluteDiscountedQuantity}
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
              invalid={formError.percentageDiscountedQuantity}
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
      )}
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
    <Suspense fallback={<Loading />}>
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
    fontFamily: 'Muli',
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
    fontFamily: 'Muli',
    fontSize: fontSizes.input,
    fontWeight: '700',
    marginRight: 5,
  },
  inputContainer: {
    height: 90,
  },
});
