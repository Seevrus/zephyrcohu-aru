import { not } from 'ramda';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';

export enum ItemAvailability {
  IN_RECEIPT,
  AVAILABLE,
  ONLY_ORDER,
}

type AnimatedListItemProps = {
  type: ItemAvailability;
  title: string;
  height: number;
};

export default function AnimatedListItem({
  type,
  title,
  height,
  children,
}: PropsWithChildren<AnimatedListItemProps>) {
  const [expanded, setExpanded] = useState<boolean>(type === ItemAvailability.IN_RECEIPT);
  const heightValue = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(heightValue, {
      toValue: expanded ? height : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [expanded, height, heightValue]);

  const backgroundColor = [colors.ok, colors.neutral, colors.warning];

  const backgroundStyle = {
    backgroundColor: backgroundColor[type],
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setExpanded(not)}
        style={({ pressed }) => [styles.item, backgroundStyle, pressed && { opacity: 0.75 }]}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
      </Pressable>
      <Animated.View style={[styles.childContainer, { height: heightValue }]}>
        <View>{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: '7%',
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  item: {
    justifyContent: 'flex-start',
  },
  titleContainer: {
    padding: 10,
  },
  title: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    marginRight: '18%',
  },
  childContainer: {
    backgroundColor: colors.neutral,
  },
});