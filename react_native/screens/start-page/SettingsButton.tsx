import { MaterialIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

export default function SettingsButton() {
  return (
    <Pressable style={({ pressed }) => [pressed && { opacity: 0.75 }]}>
      <MaterialIcons name="settings" size={36} color="white" />
    </Pressable>
  );
}
