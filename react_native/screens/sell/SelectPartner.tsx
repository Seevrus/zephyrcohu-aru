import { useState } from 'react';
import { FlatList, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import ListItem from '../../components/ListItem';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import { SelectPartnerProps } from '../screen-types';

type Partner = {
  id: number;
  name: string;
};

const PARTNERS: Partner[] = [
  {
    id: 1,
    name: 'Ügyfél 1',
  },
  {
    id: 2,
    name: 'Ügyfél 2 Valami Nagyon-Nagyon Hosszú Éssss Kiolvashtatalan Névvel',
  },
  {
    id: 3,
    name: 'Ügyfél 3',
  },
];

export default function SelectPartner({ navigation }: SelectPartnerProps) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<number>(-1);
  const confirmButtonvariant = selectedPartnerId > 0 ? 'ok' : 'disabled';

  const confirmPartnerHandler = () => {
    if (selectedPartnerId > -1) {
      navigation.navigate('SelectGoods');
    }
  };

  const selectPartnerHandler = (id: number) => {
    setSelectedPartnerId(id);
  };

  const renderPartner: ListRenderItem<Partner> = (info: ListRenderItemInfo<Partner>) => (
    <ListItem
      id={info.item.id}
      title={info.item.name}
      selected={info.item.id === selectedPartnerId}
      onPress={selectPartnerHandler}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={PARTNERS}
        extraData={selectedPartnerId}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPartner}
        ListFooterComponent={
          <View style={styles.buttonContainer}>
            <Button variant={confirmButtonvariant} onPress={confirmPartnerHandler}>
              Tovább
            </Button>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  buttonContainer: {
    marginTop: 30,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
