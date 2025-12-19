// Components/OnboardingScreen.js

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
} from 'react-native';

const LOGO = require('../assets/Logo.webp');
const BG = require('../assets/bg.webp');

const SLIDES = [
  {
    id: 1,
    text: 'Create matches, add teams, and manage the score in real time with zero effort.',
    cta: 'Next',
    image: require('../assets/onboarding1.webp'), // игрок 1
  },
  {
    id: 2,
    text: 'Football, basketball, volleyball, tennis — Wennero fits every game.',
    cta: 'Continue',
    image: require('../assets/onboarding2.webp'), // игрок 2
  },
  {
    id: 3,
    text: 'One tap — one point. Fast, simple, and perfect during live action.',
    cta: 'Next',
    image: require('../assets/onboarding3.webp'), // игрок 3
  },
  {
    id: 4,
    text: 'Start WenneroLeoRush and keep every match under control.',
    cta: 'Start',
    image: require('../assets/onboarding4.webp'), // команда
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      setIndex(prev => prev + 1);
    } else {
      navigation.replace('Home');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={BG}
        style={styles.bg}
        resizeMode="cover"
        imageStyle={slide.id === 4 ? styles.bgFlipped : undefined}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            {/* Логотип Wennero (увеличен, на последнем экране ещё больше) */}
            <Image
              source={LOGO}
              style={[styles.logo, slide.id === 4 && styles.logoLast]}
              resizeMode="contain"
            />

            {/* Текст слайда (на последнем экране скрыт) */}
            {slide.id !== 4 && (
              <View style={styles.textBlock}>
                <Text style={styles.bodyText}>{slide.text}</Text>
              </View>
            )}

            {/* Картинка игрока / команды */}
            <View
              style={[
                styles.imageBlock,
                slide.id <= 3 && styles.imageBlockShifted,
              ]}
            >
              <Image
                source={slide.image}
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            {/* Кнопка Next / Continue / Start */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryButton}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>{slide.cta}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default OnboardingScreen;

const COLORS = {
  headerBg: '#FFFFFF',
  screenBg: '#1A2B38',
  white: '#FFFFFF',
  text: '#FFFFFF',
  yellow: '#0EA5E9',
  textMuted: '#EDE9FE',
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  bg: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  logo: {
    height: 100,
    width: 260,
  },
  logoLast: {
    height: 180,
    width: 360,
    marginTop: 30,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  textBlock: {
    marginBottom:-50,
    marginTop: 44,
    paddingHorizontal: 12,
  },
  bodyText: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    color: COLORS.white,
  },
  imageBlock: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  // для первых трёх слайдов опускаем картинку вниз, чтобы заходила за кнопку
  imageBlockShifted: {
    marginBottom: -100,
    top:100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1A2B38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A2B38',
  },
  bgFlipped: {
    transform: [{ rotate: '180deg' }],
  },
});
