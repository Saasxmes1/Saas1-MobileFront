// ============================================================
// PET COMPANION — Animated mascota usando Animated API estándar
// Compatible con Expo Go (sin Reanimated worklets nativos)
// ============================================================
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Ellipse, Path, G, Rect } from 'react-native-svg';
import { Colors } from '../constants/theme';

export interface PetCompanionRef {
  playSuccess: () => void;
  playSad: () => void;
}

interface Props {
  size?: number;
  style?: object;
}

const PetCompanion = forwardRef<PetCompanionRef, Props>(({ size = 120, style }, ref) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const shadowScale = useRef(new Animated.Value(1)).current;
  const shadowOpacity = useRef(new Animated.Value(0.32)).current;

  const idleAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const startIdleAnimation = () => {
    idleAnimation.current?.stop();
    idleAnimation.current = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -5,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 5,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    idleAnimation.current.start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.04,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.98,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const playSuccess = () => {
    idleAnimation.current?.stop();

    // Reset rotation
    rotation.setValue(0);

    Animated.sequence([
      // Jump up
      Animated.spring(translateY, {
        toValue: -45,
        speed: 20,
        bounciness: 12,
        useNativeDriver: true,
      }),
      // Pop scale
      Animated.spring(scale, {
        toValue: 1.25,
        speed: 25,
        bounciness: 8,
        useNativeDriver: true,
      }),
      // Come back down
      Animated.spring(translateY, {
        toValue: 0,
        speed: 14,
        bounciness: 10,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.spring(scale, {
        toValue: 1,
        speed: 14,
        bounciness: 8,
        useNativeDriver: true,
      }).start(() => startIdleAnimation());
    });

    // 360° spin simultaneously
    Animated.timing(rotation, {
      toValue: 1,
      duration: 480,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => rotation.setValue(0));

    // Shadow shrinks when jumping
    Animated.sequence([
      Animated.timing(shadowScale, {
        toValue: 0.45,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(shadowOpacity, {
        toValue: 0.12,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(200),
      Animated.timing(shadowScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(shadowOpacity, {
        toValue: 0.32,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const playSad = () => {
    idleAnimation.current?.stop();

    Animated.sequence([
      Animated.timing(translateY, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -3, duration: 60, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start(() => startIdleAnimation());
  };

  useImperativeHandle(ref, () => ({ playSuccess, playSad }));

  useEffect(() => {
    startIdleAnimation();
    return () => idleAnimation.current?.stop();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // SVG dimensions
  const cx = size / 2;
  const bodyW = size * 0.65;
  const bodyH = size * 0.55;
  const headR = size * 0.28;
  const eyeR = size * 0.065;
  const pupilR = size * 0.032;

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View
        style={{
          transform: [
            { translateY },
            { scale },
            { rotate: spin },
          ],
        }}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Aura */}
          <Ellipse cx={cx} cy={size * 0.52} rx={size * 0.38} ry={size * 0.38} fill={Colors.brand.primary} opacity={0.18} />

          {/* Body */}
          <Rect x={cx - bodyW / 2} y={size * 0.42} width={bodyW} height={bodyH} rx={bodyW * 0.42} ry={bodyH * 0.35} fill={Colors.brand.primaryDark} />
          <Rect x={cx - bodyW * 0.18} y={size * 0.52} width={bodyW * 0.36} height={bodyH * 0.38} rx={bodyW * 0.15} fill={Colors.brand.primary} opacity={0.5} />

          {/* Feet */}
          <Ellipse cx={cx - bodyW * 0.22} cy={size * 0.88} rx={size * 0.09} ry={size * 0.055} fill={Colors.brand.primaryDark} />
          <Ellipse cx={cx + bodyW * 0.22} cy={size * 0.88} rx={size * 0.09} ry={size * 0.055} fill={Colors.brand.primaryDark} />

          {/* Arms */}
          <Ellipse cx={cx - bodyW * 0.42} cy={size * 0.6} rx={size * 0.055} ry={size * 0.1} fill={Colors.brand.primaryDark} transform={`rotate(-20, ${cx - bodyW * 0.42}, ${size * 0.6})`} />
          <Ellipse cx={cx + bodyW * 0.42} cy={size * 0.6} rx={size * 0.055} ry={size * 0.1} fill={Colors.brand.primaryDark} transform={`rotate(20, ${cx + bodyW * 0.42}, ${size * 0.6})`} />

          {/* Ears */}
          <Ellipse cx={cx - headR * 0.72} cy={size * 0.2} rx={size * 0.085} ry={size * 0.12} fill={Colors.brand.primaryDark} />
          <Ellipse cx={cx + headR * 0.72} cy={size * 0.2} rx={size * 0.085} ry={size * 0.12} fill={Colors.brand.primaryDark} />
          <Ellipse cx={cx - headR * 0.72} cy={size * 0.21} rx={size * 0.045} ry={size * 0.07} fill={Colors.brand.primary} opacity={0.6} />
          <Ellipse cx={cx + headR * 0.72} cy={size * 0.21} rx={size * 0.045} ry={size * 0.07} fill={Colors.brand.primary} opacity={0.6} />

          {/* Head */}
          <Circle cx={cx} cy={size * 0.35} r={headR} fill={Colors.brand.primary} />

          {/* Eyes */}
          <Circle cx={cx - eyeR * 1.6} cy={size * 0.33} r={eyeR} fill="white" />
          <Circle cx={cx + eyeR * 1.6} cy={size * 0.33} r={eyeR} fill="white" />
          <Circle cx={cx - eyeR * 1.6 + pupilR * 0.3} cy={size * 0.33 + pupilR * 0.2} r={pupilR} fill="#1a1a2e" />
          <Circle cx={cx + eyeR * 1.6 + pupilR * 0.3} cy={size * 0.33 + pupilR * 0.2} r={pupilR} fill="#1a1a2e" />
          <Circle cx={cx - eyeR * 1.6 - pupilR * 0.1} cy={size * 0.33 - pupilR * 0.3} r={pupilR * 0.4} fill="white" opacity={0.9} />
          <Circle cx={cx + eyeR * 1.6 - pupilR * 0.1} cy={size * 0.33 - pupilR * 0.3} r={pupilR * 0.4} fill="white" opacity={0.9} />

          {/* Cheeks */}
          <Ellipse cx={cx - headR * 0.62} cy={size * 0.38} rx={size * 0.065} ry={size * 0.04} fill="#EC4899" opacity={0.5} />
          <Ellipse cx={cx + headR * 0.62} cy={size * 0.38} rx={size * 0.065} ry={size * 0.04} fill="#EC4899" opacity={0.5} />

          {/* Smile */}
          <Path d={`M ${cx - headR * 0.32} ${size * 0.405} Q ${cx} ${size * 0.44} ${cx + headR * 0.32} ${size * 0.405}`} stroke="white" strokeWidth={size * 0.022} fill="none" strokeLinecap="round" />

          {/* Sparkle */}
          <G opacity={0.7}>
            <Path d={`M ${size * 0.82} ${size * 0.12} l ${size * 0.03} ${size * 0.06} l ${size * 0.06} ${size * 0.03} l -${size * 0.06} ${size * 0.03} l -${size * 0.03} ${size * 0.06} l -${size * 0.03} -${size * 0.06} l -${size * 0.06} -${size * 0.03} l ${size * 0.06} -${size * 0.03} Z`} fill={Colors.brand.accentLight} />
          </G>
        </Svg>
      </Animated.View>

      {/* Ground shadow */}
      <Animated.View
        style={[
          styles.shadow,
          {
            transform: [{ scaleX: shadowScale }],
            opacity: shadowOpacity,
          },
        ]}
      />
    </View>
  );
});

PetCompanion.displayName = 'PetCompanion';

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    width: 56,
    height: 10,
    borderRadius: 28,
    backgroundColor: Colors.brand.primary,
    marginTop: -6,
  },
});

export default PetCompanion;
