import { useEffect, useMemo } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

type AnimatedListItemProps = {
  expanded: boolean;
  id: number;
  title: string;
  onTitlePress: (id: number) => void;
};

export default function AnimatedListItem({
  expanded,
  id,
  title,
  onTitlePress,
}: AnimatedListItemProps) {
  const height = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(height, {
      toValue: expanded ? 100 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [expanded, height]);

  return (
    <View>
      <Pressable onPress={() => onTitlePress(id)}>
        <View>
          <Text>{title}</Text>
        </View>
      </Pressable>
      <Animated.View style={{ height, backgroundColor: 'orange' }}>
        <Text>További adatok a jégkrémről lenyitható módon</Text>
      </Animated.View>
    </View>
  );
}
