import { not } from 'ramda';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../constants/colors';
import fontSizes from '../constants/fontSizes';

type AnimatedListItemProps = {
  selected: boolean;
  title: string;
  height: number;
};

export default function AnimatedListItem({
  selected,
  title,
  height,
  children,
}: PropsWithChildren<AnimatedListItemProps>) {
  const [expanded, setExpanded] = useState<boolean>(selected);
  const heightValue = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(heightValue, {
      toValue: expanded ? height : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [expanded, height, heightValue]);

  const backgroundStyle = {
    backgroundColor: selected ? colors.ok : colors.neutral,
  };

  const rippleColor = expanded ? colors.okRipple : colors.neutralRipple;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setExpanded(not)}
        style={[styles.item, backgroundStyle]}
        android_ripple={{ color: rippleColor }}
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
