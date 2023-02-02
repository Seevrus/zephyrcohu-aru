import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View, StyleSheet, FlatList } from 'react-native';
import colors from '../constants/colors';
import fontSizes from '../constants/fontSizes';
import Button from './ui/buttons/Button';

type AnimatedRoundItemProps = {
  expanded: boolean;
  id: number;
  title: string;
  onTitlePress: (id: number) => void;
  clients: {
    id: number;
    name: string;
  }[];
};

export default function AnimatedRoundItem({
  expanded,
  id,
  title,
  onTitlePress,
  clients,
}: AnimatedRoundItemProps) {
  const height = useRef(new Animated.Value(0)).current;
  const expandedHeight = clients.length * 30 + 70;

  const [isExpandedViewVisible, setIsExpandedViewVisible] = useState(false);

  useEffect(() => {
    setIsExpandedViewVisible(false);
    Animated.timing(height, {
      toValue: expanded ? expandedHeight : 0,
      duration: 500,
      useNativeDriver: false,
    }).start(() => {
      setIsExpandedViewVisible(true);
    });
  }, [expanded, expandedHeight, height]);

  const renderClient = ({ item }) => <Text style={styles.client}>{item.name}</Text>;
  const renderSelectButton = () => (
    <View style={styles.buttonContainer}>
      <Button variant="ok">Kiválasztás</Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onTitlePress(id)}
        style={styles.item}
        android_ripple={{ color: colors.neutralRipple, borderless: true }}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
      </Pressable>
      <Animated.View style={[{ height }, styles.expandedContainer]}>
        {isExpandedViewVisible && (
          <FlatList
            data={clients}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderClient}
            ListFooterComponent={renderSelectButton}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: '7%',
    marginVertical: 10,
    backgroundColor: colors.neutral,
    borderRadius: 10,
  },
  item: {
    flex: 1,
    justifyContent: 'flex-start',
    borderRadius: 10,
  },
  titleContainer: {
    padding: 10,
    borderRadius: 10,
  },
  title: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  expandedContainer: {
    paddingHorizontal: 10,
  },
  client: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
  },
  buttonContainer: {
    paddingTop: 10,
    marginHorizontal: '30%',
    justifyContent: 'center',
  },
});
