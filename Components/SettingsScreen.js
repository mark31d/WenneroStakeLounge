import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Switch,
  Share,
} from 'react-native';

const BACK = require('../assets/back.webp');
const GEAR = require('../assets/gear.webp');

const COLORS = {
  headerBg: '#FFFFFF',
  bg: '#1A2B38',
  line: '#EDE9FE',
  white: '#FFFFFF',
  text: '#FFFFFF',
  title: '#1A2B38',
  greenOn: '#1A2B38',
  starOn: '#1A2B38',
  starOff: '#0B0B0B',
};

const TIPS = [
  {
    id: 1,
    title: 'Quick roles',
    body: 'Assign one person to watch the score, another to handle substitutions and timeouts — fewer mistakes in hot moments.',
  },
  {
    id: 2,
    title: 'Clear calls',
    body: 'Agree on short commands before the game: “switch”, “reset”, “timeout”. Wennero helps, but voice sync keeps the team sharp.',
  },
  {
    id: 3,
    title: 'Post‑game review',
    body: 'After the match, quickly review the key runs and timeouts — two minutes of talk often saves you the next game.',
  },
];

export default function SettingsScreen({ navigation }) {
  const [vibration, setVibration] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [rating, setRating] = useState(5);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const onShare = async () => {
    try {
      await Share.share({
        message: 'Try Wennero Match Control — fast score tracking and match management!',
      });
    } catch (e) {}
  };

  const onRate = () => {
    setRatingModalVisible(true);
  };

  const closeRatingModal = () => {
    setRatingModalVisible(false);
  };

  const showNextTip = () => {
    setTipIndex(prev => (prev + 1) % TIPS.length);
  };

  const showPrevTip = () => {
    setTipIndex(prev => (prev - 1 + TIPS.length) % TIPS.length);
  };

  const showRandomTip = () => {
    if (TIPS.length <= 1) return;
    let next = tipIndex;
    while (next === tipIndex) {
      next = Math.floor(Math.random() * TIPS.length);
    }
    setTipIndex(next);
  };

  return (
    <View style={styles.root}>
      {/* Верхняя safe-area (ноутч) — белая */}
      <SafeAreaView style={styles.safeTop} />

      {/* Основная safe-area — оранжевый фон до низа */}
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

          <Text style={styles.headerTitle}>Settings</Text>

          <TouchableOpacity style={styles.headerBtn} onPress={() => {}}>
            <Image
              source={GEAR}
              style={[styles.icon, styles.iconTint]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Toggles */}
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Vibration</Text>
            <Switch
              value={vibration}
              onValueChange={setVibration}
              trackColor={{ false: '#EDE9FE', true: COLORS.greenOn }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowTitle}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#EDE9FE', true: COLORS.greenOn }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.divider} />

          {/* Rate app with 5-star design */}
          <TouchableOpacity activeOpacity={0.9} style={styles.rateCard} onPress={onRate}>
            <View style={styles.rateTextBlock}>
              <Text style={styles.rateTitle}>Rate Wennero</Text>
              <Text style={styles.rateSubtitle}>5‑star experience helps us grow</Text>
            </View>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <Text
                  key={star}
                  style={[
                    styles.star,
                    star <= rating ? styles.starOn : styles.starOff,
                  ]}
                  onPress={() => setRating(star)}
                >
                  ★
                </Text>
              ))}
            </View>
          </TouchableOpacity>

          {/* Tips with random button */}
          <View style={styles.tipsBlock}>
            <Text style={styles.tipsTitle}>Team play tips</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>{TIPS[tipIndex].title}</Text>
              <Text style={styles.tipBody}>{TIPS[tipIndex].body}</Text>
            </View>

            <TouchableOpacity
              style={styles.tipRandomButton}
              activeOpacity={0.9}
              onPress={showRandomTip}
            >
              <Text style={styles.tipRandomText}>Another tip</Text>
            </TouchableOpacity>
          </View>

          {/* Share bottom */}
          <View style={styles.bottom}>
            <TouchableOpacity activeOpacity={0.9} style={styles.shareBtn} onPress={onShare}>
              <Text style={styles.shareText}>Share the app</Text>
              <Text style={styles.shareGlyph}>⤴︎</Text>
            </TouchableOpacity>
          </View>

          {/* Rating modal */}
          <Modal
            visible={ratingModalVisible}
            transparent
            animation="fade"
            onRequestClose={closeRatingModal}
          >
            <View style={styles.modalBackdrop}>
              <View className="rating-modal" style={styles.modalContent}>
                <Text style={styles.modalTitle}>Rate Wennero</Text>
                <Text style={styles.modalSubtitle}>
                  How was your experience? Tap to rate:
                </Text>
                <View style={[styles.starRow, { marginTop: 12 }]}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Text
                      key={star}
                      style={[
                        styles.star,
                        star <= rating ? styles.starOn : styles.starOff,
                      ]}
                      onPress={() => setRating(star)}
                    >
                      ★
                    </Text>
                  ))}
                </View>
                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={styles.modalButtonSecondary}
                    onPress={closeRatingModal}
                  >
                    <Text style={styles.modalButtonSecondaryText}>Later</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButtonPrimary}
                    onPress={closeRatingModal}
                  >
                    <Text style={styles.modalButtonPrimaryText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safeTop: { flex: 0, backgroundColor: COLORS.headerBg },
  safe: { flex: 1, backgroundColor: COLORS.bg },

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
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.title },

  body: { flex: 1, paddingHorizontal: 18, paddingTop: 18, backgroundColor: COLORS.bg },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800' },

  divider: { height: 1, backgroundColor: COLORS.line, opacity: 0.9 },

  rateCard: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rateTextBlock: {
    flexShrink: 1,
    paddingRight: 12,
  },
  rateTitle: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
  rateSubtitle: {
    marginTop: 4,
    color: COLORS.text,
    opacity: 0.8,
    fontSize: 12,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    fontSize: 20,
    marginHorizontal: 1,
  },
  starOn: { color: COLORS.starOn },
  starOff: { color: COLORS.starOff },

  tipsBlock: {
    marginTop: 26,
  },
  tipsTitle: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
  tipsSubtitle: {
    marginTop: 4,
    color: COLORS.text,
    opacity: 0.8,
    fontSize: 11,
  },
  tipCard: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  tipTitle: {
    color: COLORS.white,
    fontWeight: '800',
    marginBottom: 4,
    fontSize: 13,
  },
  tipBody: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
  },
  tipRandomButton: {
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  tipRandomText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  tipsCarouselRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  tipArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipArrowText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    color: '#0B0B0B',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtonsRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: COLORS.starOn,
    borderRadius: 12,
    paddingVertical: 10,
    marginLeft: 6,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    color: '#0B0B0B',
    fontWeight: '800',
  },
  modalButtonSecondary: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
    marginRight: 6,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    color: '#0B0B0B',
    fontWeight: '600',
  },

  bottom: { position: 'absolute', left: 18, right: 18, bottom: 18 },
  shareBtn: {
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  shareText: { color: '#0B0B0B', fontWeight: '800' },
  shareGlyph: { color: '#0B0B0B', fontSize: 16, marginTop: 1 },
});
