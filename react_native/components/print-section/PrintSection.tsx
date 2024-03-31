import { printAsync } from 'expo-print';
import { useAtom } from 'jotai';
import { lensProp, set } from 'ramda';
import { StyleSheet, Text, View } from 'react-native';

import { useCheckToken } from '../../api/queries/useCheckToken';
import { type Partner } from '../../api/response-mappers/mapPartnersResponse';
import { type ContextReceipt, receiptsAtom } from '../../atoms/receipts';
import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';
import { Loading } from '../Loading';
import { Button } from '../ui/Button';
import { createReceiptHtml } from './createReceiptHtml';

type PrintSectionProps = {
  partner: Partner | undefined;
  receipt: ContextReceipt | undefined;
};

export function PrintSection({ partner, receipt }: PrintSectionProps) {
  const { data: user, isPending: isUserPending } = useCheckToken();

  const [, setReceipts] = useAtom(receiptsAtom);

  const canPrint = !!user && !!receipt && !!partner;

  const printButtonVariant = canPrint ? 'ok' : 'disabled';

  const printButtonHandler = async () => {
    if (canPrint) {
      await printAsync({
        html: createReceiptHtml({
          user,
          receipt,
          partner,
        }),
      });

      if (!receipt.isPrinted) {
        await setReceipts(async (prevReceipts) =>
          (await prevReceipts).map((r) =>
            r.id === receipt.id ? set(lensProp('isPrinted'), true, r) : r
          )
        );
      }
    }
  };

  if (isUserPending) {
    return <Loading />;
  }

  return (
    <>
      <Text style={styles.text}>
        Az eredeti számla formátuma:{' '}
        <Text style={styles.numberOfReceipts}>
          {partner?.invoiceType === 'E' ? 'elektronikus' : 'papír alapú'}
        </Text>
        .
      </Text>
      {canPrint ? (
        <Text style={styles.text}>
          Az alábbi gombra koppintva megnyílik az Android rendszer nyomtatási
          párbeszédablaka, melyen keresztül lehetőség van a számla nyomtatására.
          A nyomtatás két példányban történik, melyek közül az egyik a vevőé.
        </Text>
      ) : (
        <Text style={styles.text}>
          Nem áll rendelkezésre minden adat a nyomtatáshoz.
        </Text>
      )}
      <View style={styles.buttonContainer}>
        <Button variant={printButtonVariant} onPress={printButtonHandler}>
          Nyomtatás
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50,
  },
  numberOfReceipts: {
    color: colors.ok,
    fontWeight: '700',
  },
  text: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.body,
  },
});
