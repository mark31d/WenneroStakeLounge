// Components/HomeScreen.js

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

const LOGO = require('../assets/logo_second.webp');
const GEAR = require('../assets/gear.webp');
const TRASH = require('../assets/trash.webp');

const INITIAL_MATCHES = [];

const HomeScreen = ({ navigation, route }) => {
  const [matches, setMatches] = useState(INITIAL_MATCHES);

  // warm-up таймер (отдельный режим, не связанный с матчами)
  const [warmupSeconds, setWarmupSeconds] = useState(0); // секунды до конца
  const [warmupActive, setWarmupActive] = useState(false);

  useEffect(() => {
    const newMatch = route?.params?.newMatch;
    if (newMatch) {
      setMatches(prev => [newMatch, ...prev]);
    }
  }, [route?.params?.newMatch]);

  // тик warm-up таймера
  useEffect(() => {
    if (!warmupActive || warmupSeconds <= 0) return;

    const id = setInterval(() => {
      setWarmupSeconds(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setWarmupActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [warmupActive, warmupSeconds]);

  const updateScore = (id, teamKey, delta) => {
    setMatches(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        const field = teamKey === 'team1' ? 'score1' : 'score2';
        const next = Math.max(0, (m[field] || 0) + delta);
        return { ...m, [field]: next };
      }),
    );
  };

  const confirmDelete = id => {
    Alert.alert(
      'Account deletion',
      'Are you sure you want to delete this account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            setMatches(prev => prev.filter(m => m.id !== id)),
        },
      ],
    );
  };

  const renderRightActions = (id) => (
    <TouchableOpacity
      style={styles.deleteSwipe}
      activeOpacity={0.9}
      onPress={() => confirmDelete(id)}
    >
      <Image source={TRASH} style={styles.trashSwipeIcon} />
    </TouchableOpacity>
  );

  const totalMatches = matches.length;
  const totalPoints = matches.reduce(
    (acc, m) => acc + (m.score1 || 0) + (m.score2 || 0),
    0,
  );
  const activeChallenges = matches.filter(m => !!m.challenge).length;

  const renderMatch = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      overshootRight={false}
    >
      <View style={styles.matchCard}>
        {/* Top row: challenge badge (if any) */}
        {item.challenge && (
          <View style={styles.challengeRow}>
            <View style={styles.challengeBadge}>
              <Text style={styles.challengeBadgeText}>{item.challenge}</Text>
            </View>
          </View>
        )}

        {/* Team labels */}
        <View style={[styles.rowSpace, styles.rowTeams]}>
          <Text style={styles.teamLabel}>{item.team1 || 'Team 1'}</Text>
          <Text style={styles.teamLabel}>{item.team2 || 'Team 2'}</Text>
        </View>

        {/* Scores */}
        <View style={[styles.rowSpace, styles.rowScores]}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>{item.score1 ?? 0}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>{item.score2 ?? 0}</Text>
          </View>
        </View>

        {/* +/- buttons */}
        <View style={[styles.rowSpace, styles.rowButtons]}>
          <View style={styles.buttonPair}>
            <TouchableOpacity
              style={[styles.scoreBtn, styles.plusBtn]}
              onPress={() => updateScore(item.id, 'team1', +1)}
            >
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scoreBtn, styles.minusBtn]}
              onPress={() => updateScore(item.id, 'team1', -1)}
            >
              <Text style={styles.btnText}>−</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonPair}>
            <TouchableOpacity
              style={[styles.scoreBtn, styles.plusBtn]}
              onPress={() => updateScore(item.id, 'team2', +1)}
            >
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scoreBtn, styles.minusBtn]}
              onPress={() => updateScore(item.id, 'team2', -1)}
            >
              <Text style={styles.btnText}>−</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* sport + time + format */}
        <View style={[styles.rowSpace, styles.rowMeta]}>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>{item.sport || 'Football'}</Text>
          </View>
          {item.format && (
            <View style={styles.metaChip}>
              <Text style={styles.metaText}>{item.format}</Text>
            </View>
          )}
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>{item.time || '9:00 PM'}</Text>
          </View>
        </View>
      </View>
    </Swipeable>
  );

  const createQuickMatch = () => {
    const sports = ['Football', 'Basketball', 'Volleyball', 'Tennis'];
    const formats = ['Race to 11', 'Race to 21', 'Time attack 10m', 'First to 5'];
    const adjectives = ['Red', 'Night', 'Street', 'Cold', 'Wild', 'Fast', 'Golden', 'Shadow'];
    const animals = ['Rockets', 'Owls', 'Foxes', 'Sharks', 'Wolves', 'Tigers', 'Eagles', 'Bulls'];

    const randomFrom = (arr, fallback) =>
      arr[Math.floor(Math.random() * arr.length)] || fallback;

    const sport = randomFrom(sports, 'Football');
    const format = randomFrom(formats, 'Race to 11');
    const team1 = `${randomFrom(adjectives, 'Red')} ${randomFrom(animals, 'Wolves')}`;
    const team2 = `${randomFrom(adjectives, 'Night')} ${randomFrom(animals, 'Owls')}`;

    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const challengeLabels = [
      'Random rush',
      'Challenge of the day',
      'Street series',
      'Night clash',
    ];
    const challenge = randomFrom(challengeLabels, 'Random rush');

    const newMatch = {
      id: Date.now(),
      team1,
      team2,
      score1: 0,
      score2: 0,
      sport,
      time,
      format,
      challenge,
    };

    setMatches(prev => [newMatch, ...prev]);
  };

  // полностью новый режим: тренировочный "Practice layout"
  // Заполняет доску фиксированным набором матчей для отработки сценариев.
  const createPracticeLayout = () => {
    const now = new Date();
    const baseTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const preset = [
      {
        id: Date.now(),
        team1: 'Practice Red',
        team2: 'Practice Blue',
        score1: 10,
        score2: 9,
        sport: 'Basketball',
        time: baseTime,
        format: 'Clutch 1 min',
        challenge: 'Close game drill',
      },
      {
        id: Date.now() + 1,
        team1: 'Serve Masters',
        team2: 'Return Squad',
        score1: 3,
        score2: 3,
        sport: 'Tennis',
        time: baseTime,
        format: 'Race to 5',
        challenge: 'Serve focus',
      },
      {
        id: Date.now() + 2,
        team1: 'Pressing Unit',
        team2: 'Build-up Crew',
        score1: 1,
        score2: 0,
        sport: 'Football',
        time: baseTime,
        format: 'First to 3',
        challenge: 'High press drill',
      },
    ];

    setMatches(preset);
  };

  const toggleWarmup = () => {
    // если уже идёт — остановить
    if (warmupActive) {
      setWarmupActive(false);
      setWarmupSeconds(0);
      return;
    }
    // старт нового таймера (3 минуты)
    setWarmupSeconds(3 * 60);
    setWarmupActive(true);
  };

  const formatWarmup = () => {
    const m = Math.floor(warmupSeconds / 60);
    const s = warmupSeconds % 60;
    const mm = String(m).padStart(1, '0');
    const ss = String(s).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <View style={styles.root}>
      {/* Top safe area (notch) stays white */}
      <SafeAreaView style={styles.safeTop} />

      {/* Main safe area with orange background to the bottom */}
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 32 }} />
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Image source={GEAR} style={styles.gearIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Quick actions row */}
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={[styles.quickBtn, styles.quickBtnPrimary]}
            activeOpacity={0.9}
            onPress={createQuickMatch}
          >
            <Text style={styles.quickText}>Quick match</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, styles.quickBtnSecondary]}
            activeOpacity={0.9}
            onPress={createPracticeLayout}
          >
            <Text style={styles.quickTextSecondary}>Practice layout</Text>
          </TouchableOpacity>
        </View>

        {/* Warm-up timer pill */}
        <View style={styles.warmupRow}>
          <TouchableOpacity
            style={[
              styles.warmupPill,
              warmupActive && styles.warmupPillActive,
            ]}
            activeOpacity={0.9}
            onPress={toggleWarmup}
          >
            <Text style={styles.warmupLabel}>
              {warmupActive ? 'Warm-up running' : 'Start 3 min warm-up'}
            </Text>
            {warmupActive && (
              <Text style={styles.warmupTime}>{formatWarmup()}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Small stats row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>Matches</Text>
            <Text style={styles.summaryValue}>{totalMatches}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>Total points</Text>
            <Text style={styles.summaryValue}>{totalPoints}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>Challenges</Text>
            <Text style={styles.summaryValue}>{activeChallenges}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {matches.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                You haven't created any matches yet!
              </Text>
            </View>
          ) : (
            <FlatList
              data={matches}
              keyExtractor={item => item.id.toString()}
              renderItem={renderMatch}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Bottom bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.storiesBtn}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Stories')}
            >
              <Text style={styles.storiesText}>Stories</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameBtn}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('MiniGame')}
            >
              <Text style={styles.gameText}>Game</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.plusBtnFloating}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('CreateMatch')}
            >
              <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;

const COLORS = {
  headerBg: '#FFFFFF',
  screenBg: '#0F1922',
  cardBg: '#1A2B38',
  deep: '#223849',
  yellow: '#0EA5E9',
  white: '#FFFFFF',
  textMuted: '#9CA3AF',
};

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
  quickRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: 'row',
  },
  quickBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  quickBtnPrimary: {
    backgroundColor: COLORS.white,
    marginRight: 8,
  },
  quickBtnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  quickText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  quickTextSecondary: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  warmupRow: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  warmupPill: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  warmupPillActive: {
    backgroundColor: 'rgba(14,165,233,0.12)',
    borderColor: '#0EA5E9',
  },
  warmupLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  warmupTime: {
    color: '#E5F2FF',
    fontSize: 13,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  summaryPill: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  summaryValue: {
    marginTop: 2,
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '800',
  },
  logo: {
    height: 136,
    width: 240,
  },
  settingsBtn: {
    width: 32,
    alignItems: 'flex-end',
  },
  gearIcon: {
    width: 24,
    height: 24,
    tintColor: '#1A2B38',
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 100,
  },
  matchCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowTeams: {
    marginTop: 4,
  },
  teamLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  rowScores: {
    marginTop: 8,
  },
  scoreBox: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: COLORS.deep,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  scoreText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '700',
  },
  rowButtons: {
    marginTop: 8,
  },
  buttonPair: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  scoreBtn: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  plusBtn: {
    backgroundColor: COLORS.yellow,
  },
  minusBtn: {
    backgroundColor: COLORS.white,
  },
  btnText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  rowMeta: {
    marginTop: 10,
  },
  metaChip: {
    borderRadius: 999,
    backgroundColor: COLORS.deep,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 90,
    alignItems: 'center',
  },
  metaText: {
    color: COLORS.white,
    fontSize: 12,
  },
  challengeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  challengeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  challengeBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  deleteSwipe: {
    marginTop: 0,
    marginBottom: 12,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: '#C0392B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    left:15,
  },
  trashSwipeIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storiesBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  storiesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  gameBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  gameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  plusBtnFloating: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  plusText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginTop: -2,
  },
});
