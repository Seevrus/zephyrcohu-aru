import { not } from 'ramda';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';

type AnimatedListItemProps = {
  id: number;
  expandedInitially: boolean;
  title: string;
  height: number;
  backgroundColor: string;
  onSelect?: (id: number) => void;
};

const defaultProps = {
  onSelect: () => {},
};

export default function AnimatedListItem({
  id,
  expandedInitially,
  title,
  height,
  backgroundColor,
  onSelect,
  children,
}: PropsWithChildren<AnimatedListItemProps>) {
  const [expanded, setExpanded] = useState<boolean>(expandedInitially);
  const heightValue = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(heightValue, {
      toValue: expanded ? height : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [expanded, height, heightValue]);

  const backgroundStyle = {
    backgroundColor,
  };

  const itemPressHandler = () => {
    setExpanded(not);
    onSelect(id);
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={itemPressHandler}
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
AnimatedListItem.defaultProps = defaultProps;

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
