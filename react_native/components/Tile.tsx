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
    ok: colors.ok,
    warning: colors.warning,
    neutral: colors.neutral,
    disabled: colors.disabled,
  };

  const rippleColors = {
    ok: colors.okRipple,
    warning: colors.warningRipple,
    neutral: colors.neutralRipple,
  };

  const tileStyle = {
    backgroundColor: tileColors[variant],
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tile, tileStyle]}
        disabled={variant === 'disabled'}
        android_ripple={{
          color: rippleColors[variant],
        }}
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
