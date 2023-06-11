import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable } from 'react-native';

import { StackParams } from '../screen-types';

export default function SettingsButton() {
  const navigation = useNavigation<NativeStackNavigationProp<StackParams>>();

  const handlePress = () => {
    navigation.navigate('Settings');
  };

  return (
    <Pressable style={({ pressed }) => [pressed && { opacity: 0.75 }]}>
      <MaterialIcons name="settings" size={36} color="white" onPress={handlePress} />
    </Pressable>
  );
}
