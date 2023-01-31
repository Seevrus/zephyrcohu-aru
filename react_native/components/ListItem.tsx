import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../constants/colors';
import fontSizes from '../constants/fontSizes';

type ListItemProps = {
  id: number;
  title: string;
  selected: boolean;
  onPress: (id: number) => void;
};

export default function ListItem({ id, title, selected, onPress }: ListItemProps) {
  const backgroundStyle = {
    backgroundColor: selected ? colors.ok : colors.neutral,
  };

  const rippleColor = selected ? colors.okRipple : colors.neutralRipple;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onPress(id)}
        style={[styles.item, backgroundStyle]}
        android_ripple={{ color: rippleColor }}
      >
        <View style={styles.innerContainer}>
          <View style={styles.checkboxContainer}>
            {selected ? (
              <MaterialIcons name="radio-button-checked" size={24} color="white" />
            ) : (
              <MaterialIcons name="radio-button-unchecked" size={24} color="white" />
            )}
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: '7%',
    marginVertical: 10,
  },
  item: {
    flex: 1,
    justifyContent: 'flex-start',
    borderRadius: 10,
  },
  innerContainer: {
    flexDirection: 'row',
  },
  checkboxContainer: {
    padding: 10,
    justifyContent: 'center',
  },
  titleContainer: {
    paddingVertical: 10,
  },
  title: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    marginRight: '18%',
  },
});
