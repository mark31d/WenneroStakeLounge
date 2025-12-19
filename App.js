// App.js — WenneroLeoRush (Wennero Match Control)

import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ---- Components ----
import Loader from './Components/Loader';

import OnboardingScreen from './Components/OnboardingScreen';

import HomeScreen from './Components/HomeScreen';              // Main menu + score cards
import CreateMatchScreen from './Components/CreateMatchScreen'; // Account creation flow
import StoriesScreen from './Components/StoriesScreen';         // Stories list (All / Saved)
import StoryDetailsScreen from './Components/StoryDetailsScreen'; // Full story + share
import SettingsScreen from './Components/SettingsScreen';       // Vibration / Sound / Share app
import MiniGameScreen from './Components/MiniGameScreen';       // Mini game screen

const RootStack = createNativeStackNavigator();

// тёмно-сине-жёлтая палитра под Wennero
const THEME = {
  bg: '#0F1922',       // общий тёмный фон
  card: '#1A2B38',     // карточки / панели
  text: '#FFFFFF',     // основной текст
  textMuted: '#9CA3AF',
  accent: '#0EA5E9',   // ярко-голубой акцент для кнопок / ссылок
  danger: '#C0392B',   // свайп-delete
  border: '#000000',
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: THEME.bg,
    card: THEME.bg,
    text: THEME.text,
    border: THEME.border,
  },
};

function RootNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {/* онбординг с игроками */}
      <RootStack.Screen name="Onboarding" component={OnboardingScreen} />

      {/* главное меню со списком матчей */}
      <RootStack.Screen name="Home" component={HomeScreen} />

      {/* создание / редактирование матча (Account creation макеты) */}
      <RootStack.Screen name="CreateMatch" component={CreateMatchScreen} />

      {/* Stories: список + табы All / Saved */}
      <RootStack.Screen name="Stories" component={StoriesScreen} />

      {/* Полный текст истории + Share / Save */}
      <RootStack.Screen name="StoryDetails" component={StoryDetailsScreen} />

      {/* Settings: вибрация, звук, Share the app */}
      <RootStack.Screen name="Settings" component={SettingsScreen} />

      {/* Mini Game: мини-игра */}
      <RootStack.Screen name="MiniGame" component={MiniGameScreen} />
    </RootStack.Navigator>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 10000); // общая длительность лоадера Wennero ~10 секунд
    return () => clearTimeout(t);
  }, []);

  if (booting) {
    return <Loader fullscreen />; // зелёный фон + логотип Wennero
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
