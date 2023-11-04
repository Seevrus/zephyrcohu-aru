import { not } from 'ramda';
import {
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';

type AnimatedListItemProps = {
  id: string | number;
  expandedInitially: boolean;
  title: string | ReactNode;
  height: number;
  backgroundColor: string;
  onSelect?: (id: string | number) => void;
};

export function AnimatedListItem({
  id,
  expandedInitially,
  title,
  height,
  backgroundColor,
  onSelect = () => {},
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
        style={({ pressed }) => [
          styles.item,
          backgroundStyle,
          pressed && { opacity: 0.75 },
        ]}
      >
        <View style={styles.titleContainer}>
          {typeof title === 'string' && (
            <Text style={styles.title}>{title}</Text>
          )}
          {typeof title !== 'string' && title}
        </View>
      </Pressable>
      <Animated.View style={[styles.childContainer, { height: heightValue }]}>
        <View>{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  childContainer: {
    backgroundColor: colors.neutral,
  },
  container: {
    borderRadius: 10,
    flex: 1,
    marginHorizontal: '7%',
    marginVertical: 10,
    overflow: 'hidden',
  },
  item: {
    justifyContent: 'flex-start',
  },
  title: {
    color: colors.white,
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    marginRight: '18%',
  },
  titleContainer: {
    padding: 10,
  },
});
