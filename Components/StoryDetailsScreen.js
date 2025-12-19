import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Share,
} from 'react-native';

import { STORIES } from './StoriesData';
const BACK = require('../assets/back.webp');
const GEAR = require('../assets/gear.webp');
const SHARE_ICON = require('../assets/share.webp');

const COLORS = {
  headerBg: '#FFFFFF',
  screenBg: '#0F1922',
  cardBg: '#1A2B38',
  cardInner: '#223849',
  text: '#E5F2FF',
  textMuted: '#9CA3AF',
  btnWhite: '#FFFFFF',
  btnYellow: '#0EA5E9',
  title: '#E5F2FF',
};

export default function StoryDetailsScreen({ navigation, route }) {
  const storyId = route?.params?.storyId ?? 1;

  const story = useMemo(
    () => STORIES.find(s => s.id === storyId) || STORIES[0],
    [storyId]
  );

  const [saved, setSaved] = useState(!!route?.params?.saved);

  const onShare = async () => {
    try {
      await Share.share({ message: `${story.title}\n\n${story.body}` });
    } catch (e) {}
  };

  const onToggleSave = () => {
    setSaved(v => !v);
    // если хочешь синхронизировать Saved в списке — можно прокинуть коллбек:
    // route?.params?.onToggleSave?.(storyId);
  };

  return (
    <View style={styles.root}>
      {/* Верхняя safe-area (ноутч) — белая */}
      <SafeAreaView style={styles.safeTop} />

      {/* Основная safe-area — цветной фон до низа */}
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Image
              source={BACK}
              style={[styles.icon, styles.iconTint]}
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
              style={[styles.icon, styles.iconTint]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={styles.storyTitle}>{story.title}</Text>

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.storyText}>{story.body}</Text>
              </ScrollView>
            </View>

            <View style={styles.bottomRow}>
              <TouchableOpacity activeOpacity={0.9} style={styles.shareBtn} onPress={onShare}>
                <Image
                  source={SHARE_ICON}
                  style={styles.shareIcon}
                  resizeMode="contain"
                />
                <Text style={styles.shareText}>Share the story</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.saveBtn, saved ? styles.saveBtnSaved : styles.saveBtnPlain]}
                onPress={onToggleSave}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.screenBg },
  safeTop: { flex: 0, backgroundColor: COLORS.headerBg },
  safe: { flex: 1, backgroundColor: COLORS.screenBg },

  header: {
    height: 76,
    backgroundColor: COLORS.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 24, height: 24 },
  iconTint: { tintColor: '#1A2B38' },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.title,
  },

  content: { flex: 1, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 16 },

  card: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 10,
  },
  cardInner: {
    flex: 1,
    backgroundColor: COLORS.cardInner,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 10,
  },

  storyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 6 },
  storyText: {
    color: COLORS.textMuted,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
  },

  bottomRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  shareBtn: {
    flex: 1,
    backgroundColor: COLORS.btnWhite,
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  shareText: { color: '#0B0B0B', fontWeight: '800' },
  shareIcon: { width: 18, height: 18, tintColor: '#1A2B38' },

  saveBtn: {
    width: 110,
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  saveBtnPlain: { backgroundColor: COLORS.btnWhite },
  saveBtnSaved: { backgroundColor: COLORS.btnYellow },
  saveText: { color: '#0B0B0B', fontWeight: '900' },
});
