import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';

import { STORIES } from './StoriesData';

const BACK = require('../assets/back.webp');
const GEAR = require('../assets/gear.webp');

const COLORS = {
  headerBg: '#FFFFFF',
  screenBg: '#0F1922',
  cardBg: '#1A2B38',
  deep: '#223849',
  yellow: '#0EA5E9',
  white: '#FFFFFF',
  textMuted: '#9CA3AF',
};

const StoriesScreen = ({ navigation }) => {
  const [tab, setTab] = useState('all'); // 'all' | 'saved'
  const [savedIds, setSavedIds] = useState(new Set());

  const data = useMemo(() => {
    if (tab === 'saved') return STORIES.filter(s => savedIds.has(s.id));
    return STORIES;
  }, [tab, savedIds]);

  const toggleSaved = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderItem = ({ item }) => {
    const snippet = item.body.replace(/\s+/g, ' ').slice(0, 64) + '...';
    const isSaved = savedIds.has(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.storyCard}
        onPress={() =>
          navigation.navigate('StoryDetails', {
            storyId: item.id,
            isSaved,
            toggleSaved: () => toggleSaved(item.id),
          })
        }
      >
        <Text style={styles.storyTitle}>{item.title}</Text>
        <Text style={styles.storySnippet} numberOfLines={1}>
          {snippet}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      {/* Верхняя safe-area (ноутч) — белая */}
      <SafeAreaView style={styles.safeTop} />

      {/* Основная safe-area — оранжевый фон до низа */}
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Image
              source={BACK}
              style={[styles.icon, styles.backIcon]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Stories</Text>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Image
              source={GEAR}
              style={[styles.icon, styles.gearIcon]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Body with orange background to the very bottom */}
        <View style={styles.screenBg}>
          {/* Segmented */}
          <View style={styles.segmentWrap}>
            <View style={styles.segment}>
              <TouchableOpacity
                style={[styles.segmentBtn, tab === 'all' && styles.segmentBtnActive]}
                onPress={() => setTab('all')}
                activeOpacity={0.9}
              >
                <Text style={[styles.segmentText, tab === 'all' && styles.segmentTextActive]}>
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, tab === 'saved' && styles.segmentBtnActive]}
                onPress={() => setTab('saved')}
                activeOpacity={0.9}
              >
                <Text style={[styles.segmentText, tab === 'saved' && styles.segmentTextActive]}>
                  Saved
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          <FlatList
            data={data}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default StoriesScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.screenBg },
  safeTop: { flex: 0, backgroundColor: COLORS.headerBg },
  safeArea: { flex: 1, backgroundColor: COLORS.screenBg },
  screenBg: { flex: 1, backgroundColor: COLORS.screenBg },

  header: {
    height: 72,
    backgroundColor: COLORS.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerBtn: { width: 32, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 24, height: 24 },
  backIcon: { tintColor: '#1A2B38' },
  gearIcon: { tintColor: '#1A2B38' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },

  segmentWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: COLORS.screenBg,
  },
  segment: {
    backgroundColor: COLORS.deep,
    borderRadius: 14,
    padding: 4,
    flexDirection: 'row',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: { backgroundColor: COLORS.yellow },
  segmentText: { color: COLORS.textMuted, fontWeight: '700' },
  segmentTextActive: { color: '#000' },

  listContent: { paddingHorizontal: 16, paddingBottom: 24 },

  storyCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  storyTitle: { color: COLORS.white, fontWeight: '800', fontSize: 14, marginBottom: 6 },
  storySnippet: { color: COLORS.textMuted, fontSize: 12 },
});
