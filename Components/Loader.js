// Components/Loader.js
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, Animated, Easing } from 'react-native';

// логотип WENNERO (вторая фаза лоадера)
const LOGO = require('../assets/Logo.webp');

const Loader = ({ fullscreen = false }) => {
  const [showLogo, setShowLogo] = useState(false);

  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0.4)).current;
  const dot1 = useRef(new Animated.Value(0.6)).current;
  const dot2 = useRef(new Animated.Value(0.6)).current;
  const dot3 = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loopRing = Animated.loop(
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 1.1,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const pulse = (value, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.6,
            duration: 260,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

    loopRing.start();
    const d1 = pulse(dot1, 0);
    const d2 = pulse(dot2, 120);
    const d3 = pulse(dot3, 240);
    d1.start();
    d2.start();
    d3.start();

    const t = setTimeout(() => setShowLogo(true), 3500);

    return () => {
      clearTimeout(t);
      loopRing.stop();
      d1.stop();
      d2.stop();
      d3.stop();
    };
  }, [ringScale, ringOpacity, dot1, dot2, dot3]);

  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      {showLogo ? (
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      ) : (
        <View style={styles.iconWrapper}>
          <Animated.View
            style={[
              styles.ring,
              {
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
              },
            ]}
          />
          <View style={styles.dotsRow}>
            <Animated.View
              style={[
                styles.dot,
                styles.dotAccent,
                { transform: [{ scale: dot1 }] },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                styles.dotMid,
                { transform: [{ scale: dot2 }] },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                styles.dotLight,
                { transform: [{ scale: dot3 }] },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F1922', // тёмный фон в духе остального приложения
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreen: {
    flex: 1,
  },
  iconWrapper: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'rgba(14, 165, 233, 0.7)', // ярко-голубой акцент
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dotAccent: {
    backgroundColor: '#0EA5E9',
  },
  dotMid: {
    backgroundColor: '#1A2B38',
  },
  dotLight: {
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 250,
    height: 250, // логотип по центру экрана
  },
});

export default Loader;
