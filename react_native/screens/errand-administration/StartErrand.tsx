import { useState } from 'react';
import { Animated, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import AnimatedRoundItem from '../../components/AnimatedRoundItem';
import colors from '../../constants/colors';
import { useAppSelector } from '../../store/hooks';

type RoundListItem = {
  id: number;
  name: string;
  clients: {
    id: number;
    name: string;
  }[];
};

export default function StartErrand() {
  const rounds = useAppSelector((state) => state.rounds);
  const clients = useAppSelector((state) => state.clients);

  const [selectedRoundId, setSelectedRoundId] = useState<number>(-1);

  const roundListItems: RoundListItem[] = rounds
    .map((round) => ({
      id: round.id,
      name: round.name,
      clients: round.clientIds
        .map((clientId) => {
          const client = clients.find((c) => c.id === clientId);

          return {
            id: clientId,
            name: client.name,
          };
        })
        .sort((client1, client2) => client1.name.localeCompare(client2.name, 'hu-HU')),
    }))
    .sort((round1, round2) => round1.name.localeCompare(round2.name, 'hu-HU'));

  const selectRoundHandler = (id: number) => {
    setSelectedRoundId(id);
  };

  const renderRoundItem: ListRenderItem<RoundListItem> = (
    info: ListRenderItemInfo<RoundListItem>
  ) => (
    <AnimatedRoundItem
      id={info.item.id}
      title={info.item.name}
      expanded={info.item.id === selectedRoundId}
      onTitlePress={selectRoundHandler}
      clients={info.item.clients}
    />
  );

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={roundListItems}
        extraData={selectedRoundId}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRoundItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
