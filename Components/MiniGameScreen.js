// Components/MiniGameScreen.js
// Улучшения: сохранение рекорда (AsyncStorage), комбо/множитель, промахи (тап по полю),
// прогресс-бар таймера, стартовый отсчёт 3-2-1, пульс цели, фикс “устаревшего score” через refs,
// аккуратная генерация позиции по размерам поля, вибрация на попадание.
//
// Если нет AsyncStorage:
// npm i @react-native-async-storage/async-storage
// (и pod install для iOS)

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
  Vibration,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACK = require('../assets/back.webp');
const GEAR = require('../assets/gear.webp');

const COLORS = {
  headerBg: '#FFFFFF',
  screenBg: '#0F1922',
  cardBg: '#1A2B38',
  deep: '#223849',
  white: '#FFFFFF',
  textMuted: '#9CA3AF',
  success: '#10B981',
  danger: '#EF4444',
  accent: '#0EA5E9',
};

const GAME_DURATION = 30;
const STORAGE_KEYS = {
  highScore: 'minigame_highscore_v2',
  bestCombo: 'minigame_bestcombo_v2',
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const MiniGameScreen = ({ navigation }) => {
  const [score, setScore] = useState(0); // очки (с учётом множителя)
  const [hits, setHits] = useState(0); // чистые попадания
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameActive, setGameActive] = useState(false);

  const [targetPosition, setTargetPosition] = useState({ x: 80, y: 120 }); // px
  const [fieldSize, setFieldSize] = useState({ w: 0, h: 0 });

  const [highScore, setHighScore] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

  const [resultVisible, setResultVisible] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [lastWasRecord, setLastWasRecord] = useState(false);

  const [combo, setCombo] = useState(0);
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState(null); // 3..0 или null

  // Animations
  const tapScaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Refs (фикс "устаревших значений" при вызовах из таймеров)
  const intervalRef = useRef(null);
  const scoreRef = useRef(0);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const comboRef = useRef(0);
  const highScoreRef = useRef(0);
  const bestComboRef = useRef(0);

  const lastHitTsRef = useRef(0);
  const ignoreMissUntilRef = useRef(0); // защита от двойного срабатывания miss при тапе по цели

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { hitsRef.current = hits; }, [hits]);
  useEffect(() => { missesRef.current = misses; }, [misses]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { highScoreRef.current = highScore; }, [highScore]);
  useEffect(() => { bestComboRef.current = bestCombo; }, [bestCombo]);

  // target size уменьшается ближе к концу
  const targetSize = useMemo(() => {
    const progress = 1 - timeLeft / GAME_DURATION; // 0..1
    const base = 84;
    const min = 54;
    return Math.round(Math.max(min, base - progress * 24));
  }, [timeLeft]);

  // Множитель: каждые 5 комбо +1, максимум x5
  const multiplier = useMemo(() => {
    const m = 1 + Math.floor(Math.max(0, combo - 1) / 5);
    return clamp(m, 1, 5);
  }, [combo]);

  // Загрузка рекордов
  useEffect(() => {
    (async () => {
      try {
        const hs = await AsyncStorage.getItem(STORAGE_KEYS.highScore);
        const bc = await AsyncStorage.getItem(STORAGE_KEYS.bestCombo);
        if (hs) setHighScore(Number(hs) || 0);
        if (bc) setBestCombo(Number(bc) || 0);
      } catch (e) {
        // если storage недоступен — просто игнор
      }
    })();
  }, []);

  // Сохранение рекордов
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.highScore, String(highScore));
      } catch (e) {}
    })();
  }, [highScore]);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.bestCombo, String(bestCombo));
      } catch (e) {}
    })();
  }, [bestCombo]);

  const generateNewTarget = useCallback(() => {
    const w = fieldSize.w;
    const h = fieldSize.h;

    // если ещё нет размеров — ставим в центр как дефолт
    if (!w || !h) {
      setTargetPosition({ x: 80, y: 120 });
      return;
    }

    const pad = 14;
    const half = targetSize / 2;

    const minX = pad + half;
    const maxX = w - pad - half;
    const minY = pad + half;
    const maxY = h - pad - half;

    const x = Math.random() * (maxX - minX) + minX;
    const y = Math.random() * (maxY - minY) + minY;

    setTargetPosition({ x, y });
  }, [fieldSize.w, fieldSize.h, targetSize]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const endGame = useCallback(() => {
    clearTimer();
    setGameActive(false);
    setStarting(false);
    setCountdown(null);

    const finalScore = scoreRef.current;
    const isRecord = finalScore > highScoreRef.current;

    setLastScore(finalScore);
    setLastWasRecord(isRecord);

    if (isRecord) setHighScore(finalScore);
    if (bestComboRef.current < comboRef.current) setBestCombo(comboRef.current);

    setResultVisible(true);

    // лёгкая вибрация по окончанию
    if (Platform.OS !== 'web') {
      Vibration.vibrate(isRecord ? [0, 40, 40, 60] : 25);
    }
  }, [clearTimer]);

  // Запуск таймера
  useEffect(() => {
    if (!gameActive) return;

    clearTimer();
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // завершение
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimer();
  }, [gameActive, clearTimer, endGame]);

  // Пульсация цели, пока игра активна
  useEffect(() => {
    if (!gameActive) {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [gameActive, pulseAnim]);

  const startGame = useCallback(() => {
    // сброс
    clearTimer();
    setResultVisible(false);

    setScore(0);
    setHits(0);
    setMisses(0);
    setCombo(0);

    scoreRef.current = 0;
    hitsRef.current = 0;
    missesRef.current = 0;
    comboRef.current = 0;

    setTimeLeft(GAME_DURATION);

    // стартовый отсчёт
    setStarting(true);
    setCountdown(3);
    setGameActive(false);
  }, [clearTimer]);

  // Отсчёт 3-2-1-GO
  useEffect(() => {
    if (!starting) return;

    if (countdown === 0) {
      // коротко показываем GO
      const t = setTimeout(() => {
        setStarting(false);
        setGameActive(true);
        generateNewTarget();
      }, 300);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setCountdown(c => (typeof c === 'number' ? Math.max(0, c - 1) : 0));
    }, 1000);

    return () => clearTimeout(t);
  }, [starting, countdown, generateNewTarget]);

  const animateHit = useCallback(() => {
    Animated.sequence([
      Animated.timing(tapScaleAnim, { toValue: 1.25, duration: 90, useNativeDriver: true }),
      Animated.timing(tapScaleAnim, { toValue: 1, duration: 110, useNativeDriver: true }),
    ]).start();
  }, [tapScaleAnim]);

  const resetCombo = useCallback(() => {
    setCombo(0);
    comboRef.current = 0;
    lastHitTsRef.current = 0;
  }, []);

  const handleTargetPress = useCallback(() => {
    if (!gameActive) return;

    ignoreMissUntilRef.current = Date.now() + 120;

    const now = Date.now();
    const delta = now - (lastHitTsRef.current || 0);
    lastHitTsRef.current = now;

    // Комбо: если быстро — наращиваем, иначе сбрасываем
    const nextCombo = delta > 0 && delta <= 650 ? comboRef.current + 1 : 1;
    setCombo(nextCombo);
    comboRef.current = nextCombo;

    // Очки с множителем
    const nextMultiplier = clamp(1 + Math.floor(Math.max(0, nextCombo - 1) / 5), 1, 5);
    setScore(prev => prev + nextMultiplier);
    setHits(prev => prev + 1);

    // вибрация на попадание
    if (Platform.OS !== 'web') Vibration.vibrate(10);

    animateHit();
    generateNewTarget();
  }, [gameActive, animateHit, generateNewTarget]);

  const handleMiss = useCallback(() => {
    if (!gameActive) return;
    if (Date.now() < ignoreMissUntilRef.current) return;

    setMisses(m => m + 1);

    // лёгкий штраф (можешь убрать)
    setScore(s => Math.max(0, s - 1));

    resetCombo();

    if (Platform.OS !== 'web') Vibration.vibrate(18);
  }, [gameActive, resetCombo]);

  // Таймер прогресса
  const timeProgress = useMemo(() => {
    return clamp(timeLeft / GAME_DURATION, 0, 1);
  }, [timeLeft]);

  // Статистика для модалки
  const stats = useMemo(() => {
    const h = hits;
    const m = misses;
    const total = h + m;
    const acc = total ? Math.round((h / total) * 100) : 0;
    const tapsPerSec = GAME_DURATION ? (h / GAME_DURATION).toFixed(2) : '0.00';
    return { acc, tapsPerSec };
  }, [hits, misses]);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeTop} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => {
              if (gameActive || starting) {
                // если игра идёт — просто остановим
                endGame();
                return;
              }
              navigation.goBack();
            }}
          >
            <Image source={BACK} style={[styles.icon, styles.iconTint]} resizeMode="contain" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Mini Game</Text>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Image source={GEAR} style={[styles.icon, styles.iconTint]} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Score</Text>
              <Text style={styles.statValue}>{score}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>x{multiplier}</Text>
                </View>
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Time</Text>
              <Text style={[styles.statValue, timeLeft < 10 && styles.timeWarning]}>
                {timeLeft}s
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${timeProgress * 100}%` }]} />
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Best</Text>
              <Text style={styles.statValue}>{highScore}</Text>
              <Text style={styles.subTiny}>Combo {bestCombo}</Text>
            </View>
          </View>

          {/* Mini stats */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Hits: {hits}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>Miss: {misses}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>Combo: {combo}</Text>
          </View>

          {/* Game Field (всегда рендерим, чтобы мерить размеры) */}
          <TouchableOpacity
            style={styles.gameField}
            activeOpacity={1}
            onPress={handleMiss}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setFieldSize({ w: width, h: height });
            }}
          >
            {/* Подложка */}
            <View style={styles.fieldTopGlow} />

            {/* Цель */}
            {gameActive && (
              <TouchableOpacity
                style={[
                  styles.target,
                  {
                    left: targetPosition.x,
                    top: targetPosition.y,
                    width: targetSize,
                    height: targetSize,
                    transform: [{ translateX: -targetSize / 2 }, { translateY: -targetSize / 2 }],
                  },
                ]}
                onPress={handleTargetPress}
                activeOpacity={0.85}
              >
                <Animated.View
                  style={[
                    styles.targetInner,
                    {
                      width: targetSize,
                      height: targetSize,
                      borderRadius: targetSize / 2,
                      transform: [{ scale: tapScaleAnim }, { scale: pulseScale }],
                      opacity: pulseOpacity,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.targetRing,
                    {
                      width: targetSize + 10,
                      height: targetSize + 10,
                      borderRadius: (targetSize + 10) / 2,
                    },
                  ]}
                />
              </TouchableOpacity>
            )}

            {/* Оверлей: инструкции */}
            {!gameActive && !starting && (
              <View style={styles.overlayCenter}>
                <View style={styles.instructionsCard}>
                  <Text style={styles.instructionsTitle}>Tap the Target!</Text>
                  <Text style={styles.instructionsText}>
                    Тапай по цели как можно быстрее. Быстрые попадания дают комбо и множитель.
                    Промах по полю — штраф и сброс комбо.
                  </Text>

                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={startGame}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.startButtonText}>Start Game</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Оверлей: отсчёт */}
            {starting && (
              <View style={styles.countdownOverlay}>
                <Text style={styles.countdownText}>
                  {countdown === 0 ? 'GO!' : countdown}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Buttons */}
          {gameActive && (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={endGame}
              activeOpacity={0.9}
            >
              <Text style={styles.stopButtonText}>Stop Game</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Result modal */}
        <Modal
          visible={resultVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setResultVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Game over</Text>

              <Text style={styles.modalScore}>
                Your score:{' '}
                <Text style={styles.modalScoreNumber}>{lastScore}</Text>
              </Text>

              <Text style={styles.modalHighScore}>
                Best:{' '}
                <Text style={styles.modalScoreNumber}>{highScore}</Text>
              </Text>

              <View style={styles.modalStatsRow}>
                <View style={styles.modalPill}>
                  <Text style={styles.modalPillText}>Accuracy {stats.acc}%</Text>
                </View>
                <View style={styles.modalPill}>
                  <Text style={styles.modalPillText}>Hits/sec {stats.tapsPerSec}</Text>
                </View>
                <View style={styles.modalPill}>
                  <Text style={styles.modalPillText}>Best combo {bestCombo}</Text>
                </View>
              </View>

              {lastWasRecord && (
                <Text style={styles.modalRecord}>New high score!</Text>
              )}

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalSecondaryButton}
                  activeOpacity={0.85}
                  onPress={() => setResultVisible(false)}
                >
                  <Text style={styles.modalSecondaryText}>Close</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalPrimaryButton}
                  activeOpacity={0.9}
                  onPress={() => {
                    setResultVisible(false);
                    startGame();
                  }}
                >
                  <Text style={styles.modalPrimaryText}>Play again</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default MiniGameScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  safeTop: {
    flex: 0,
    backgroundColor: COLORS.headerBg,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },

  header: {
    height: 72,
    backgroundColor: COLORS.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerBtn: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { width: 24, height: 24 },
  iconTint: { tintColor: '#1A2B38' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },

  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '800',
  },
  timeWarning: { color: COLORS.danger },
  subTiny: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '700',
  },

  badgeRow: { marginTop: 8 },
  badge: {
    backgroundColor: 'rgba(250,223,76,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(250,223,76,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: COLORS.accent,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.2,
  },

  progressBar: {
    marginTop: 10,
    width: '86%',
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: COLORS.accent,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '700',
    fontSize: 12,
  },
  metaDot: {
    marginHorizontal: 8,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '900',
  },

  gameField: {
    flex: 1,
    backgroundColor: COLORS.deep,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  fieldTopGlow: {
    position: 'absolute',
    top: -120,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(250,223,76,0.10)',
  },

  overlayCenter: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  instructionsCard: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
  },
  instructionsTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  instructionsText: {
    color: COLORS.textMuted,
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },

  startButton: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  startButtonText: {
    color: '#1A2B38',
    fontSize: 16,
    fontWeight: '900',
  },

  countdownOverlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  countdownText: {
    color: COLORS.white,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 1,
  },

  target: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetInner: {
    backgroundColor: COLORS.accent,
    borderWidth: 4,
    borderColor: '#1A2B38',
  },
  targetRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(250,223,76,0.35)',
  },

  stopButton: {
    marginTop: 14,
    backgroundColor: COLORS.danger,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  stopButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    backgroundColor: COLORS.white,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    color: '#111827',
  },
  modalScore: {
    fontSize: 16,
    textAlign: 'center',
    color: '#111827',
  },
  modalHighScore: {
    fontSize: 14,
    textAlign: 'center',
    color: '#4B5563',
    marginTop: 4,
  },
  modalScoreNumber: { fontWeight: '900' },

  modalStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  modalPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
  },
  modalPillText: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 12,
  },

  modalRecord: {
    marginTop: 10,
    textAlign: 'center',
    color: COLORS.success,
    fontWeight: '900',
  },

  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  modalSecondaryButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 10,
    marginRight: 6,
    alignItems: 'center',
  },
  modalSecondaryText: {
    color: '#111827',
    fontWeight: '700',
  },
  modalPrimaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#1A2B38',
    paddingVertical: 10,
    marginLeft: 6,
    alignItems: 'center',
  },
  modalPrimaryText: {
    color: COLORS.white,
    fontWeight: '900',
  },
});
