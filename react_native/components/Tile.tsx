import { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

import colors from '../constants/colors';
import fontSizes from '../constants/fontSizes';

type TileProps = {
  title: string;
  Icon: FC<SvgProps>;
  variant: 'ok' | 'warning' | 'disabled' | 'neutral';
};

export default function Tile({ title, Icon, variant }: TileProps) {
  const tileColors = {
    ok: colors.green600,
    warning: colors.yellow800,
    neutral: colors.purple800,
    disabled: colors.gray500,
  };

  const tileStyle = {
    backgroundColor: tileColors[variant],
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.tile, tileStyle, pressed && styles.tilePressed]}
        disabled={variant === 'disabled'}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Icon width={80} height={80} color="white" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    borderRadius: 10,
  },
  tile: {
    flex: 1,
    width: '80%',
    paddingTop: 20,
    borderRadius: 10,
  },
  tilePressed: {
    opacity: 0.75,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  iconContainer: {
    flex: 2,
    alignItems: 'center',
  },
});
