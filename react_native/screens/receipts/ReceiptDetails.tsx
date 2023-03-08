import { FlatList, StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';

export default function ReceiptDetails() {
  const items = [
    {
      id: '001',
      vtsz: '**** **',
      articleNumber: '******8*',
      expiresAt: '****.**',
      name: '*************************************40*',
      quantity: 'xxxxxx8x',
      unitName: 'karton',
      netPrice: 'xxxxxx8x',
      netAmount: 'xxxxxxx10x',
      vat: '27%',
      vatAmount: 'xxxxxxx10x',
      grossAmount: 'xxxxxxx10x',
    },
    {
      id: '002',
      vtsz: '**** **',
      articleNumber: '******8*',
      expiresAt: '****.**',
      name: '*************************************40*',
      quantity: 'xxxxxx8x',
      unitName: 'karton',
      netPrice: 'xxxxxx8x',
      netAmount: 'xxxxxxx10x',
      vat: '27%',
      vatAmount: 'xxxxxxx10x',
      grossAmount: 'xxxxxxx10x',
    },
    {
      id: '003',
      vtsz: '**** **',
      articleNumber: '******8*',
      expiresAt: '****.**',
      name: '*************************************40*',
      quantity: 'xxxxxx8x',
      unitName: 'karton',
      netPrice: 'xxxxxx8x',
      netAmount: 'xxxxxxx10x',
      vat: '27%',
      vatAmount: 'xxxxxxx10x',
      grossAmount: 'xxxxxxx10x',
    },
    {
      id: '004',
      vtsz: '**** **',
      articleNumber: '******8*',
      expiresAt: '****.**',
      name: '*************************************40*',
      quantity: 'xxxxxx8x',
      unitName: 'karton',
      netPrice: 'xxxxxx8x',
      netAmount: 'xxxxxxx10x',
      vat: '27%',
      vatAmount: 'xxxxxxx10x',
      grossAmount: 'xxxxxxx10x',
    },
    {
      id: '005',
      vtsz: '**** **',
      articleNumber: '******8*',
      expiresAt: '****.**',
      name: '*************************************40*',
      quantity: 'xxxxxx8x',
      unitName: 'karton',
      netPrice: 'xxxxxx8x',
      netAmount: 'xxxxxxx10x',
      vat: '27%',
      vatAmount: 'xxxxxxx10x',
      grossAmount: 'xxxxxxx10x',
    },
    {
      id: '006',
      vtsz: '**** **',
      articleNumber: '******8*',
      expiresAt: '****.**',
      name: '*************************************40*',
      quantity: 'xxxxxx8x',
      unitName: 'karton',
      netPrice: 'xxxxxx8x',
      netAmount: 'xxxxxxx10x',
      vat: '27%',
      vatAmount: 'xxxxxxx10x',
      grossAmount: 'xxxxxxx10x',
    },
  ];

  const header = () => (
    <View>
      <Text style={styles.text}>Storno számla</Text>
      <Text style={styles.text}>Számlaszám: xxxxxxxx/xx</Text>
      <Text style={styles.text}>Stornozott számla száma: xxxxxxxx/xx</Text>
      <Text style={styles.text}>Vevő</Text>
      <Text style={styles.text}>Neve: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx45x</Text>
      <Text style={styles.text}>
        Címe: xx4x xxxxxxxxxxxxxxxxx20x xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx38x
      </Text>
      <Text style={styles.text}>Bank: xxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx</Text>
      <Text style={styles.text}>Adószám: xxxxxxxx-x-xx</Text>
      <Text style={styles.text}>Vevő szállítási címe</Text>
      <Text style={styles.text}>Neve: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx45x</Text>
      <Text style={styles.text}>
        Címe: xx4x xxxxxxxxxxxxxxxxx20x xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx38x
      </Text>
      <Text style={styles.text}>Kelt: xxxx.xx.xx</Text>
      <Text style={styles.text}>Teljesítés: xxxx.xx.xx</Text>
      <Text style={styles.text}>Fizetés: Készpénz, xxxx.xx.xx</Text>
    </View>
  );

  const renderItems = () => (
    <View>
      <Text style={styles.text}>001.</Text>
      <Text style={styles.text}>Megnevezés</Text>
      <Text style={styles.text}>Nettó egységár</Text>
      <Text style={styles.text}>Mennyiség</Text>
      <Text style={styles.text}>Nettó összeg</Text>
      <Text style={styles.text}>Bruttó összeg</Text>
    </View>
  );

  const footer = () => (
    <View>
      <Text style={styles.text}>Számla mindösszesen</Text>
      <Text style={styles.text}>Kerekítés</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={header}
        data={items}
        renderItem={renderItems}
        keyExtractor={(item) => item.id}
        ListFooterComponent={footer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  text: {
    color: 'white',
    fontFamily: 'Muli',
  },
});
