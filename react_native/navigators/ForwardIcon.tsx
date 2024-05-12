import { MaterialIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

type ForwardProps = {
  onPress: () => void;
};

export function ForwardIcon({ onPress }: ForwardProps) {
  return (
    <Pressable onPress={onPress}>
      <MaterialIcons name="arrow-forward" size={24} color="white" />
    </Pressable>
  );
}
