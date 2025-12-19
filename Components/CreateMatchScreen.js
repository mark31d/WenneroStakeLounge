// Components/CreateMatchScreen.js

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const LOGO = require('../assets/logo_second.webp');
const BACK = require('../assets/back.webp');
const GEAR = require('../assets/gear.webp');

const COLORS = {
  headerBg: '#FFFFFF',
  screenBg: '#0F1922',   // как HomeScreen
  cardBg: '#1A2B38',
  deep: '#223849',
  yellow: '#0EA5E9',
  white: '#FFFFFF',
  textMuted: '#EDE9FE',
};

const createDefaultTime = () => {
  const d = new Date();
  d.setHours(21, 0, 0, 0); // 9:00 PM
  return d;
};

const formatTime = date =>
  date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

const CreateMatchScreen = ({ navigation }) => {
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [sport, setSport] = useState('');
  const [time, setTime] = useState(createDefaultTime);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const formattedTime = formatTime(time);

  const handleSave = () => {
    if (!team1.trim() || !team2.trim()) return;

    const newMatch = {
      id: Date.now(),
      team1: team1.trim(),
      team2: team2.trim(),
      score1: 0,
      score2: 0,
      sport: sport.trim() || 'Football',
      time: formattedTime,
    };

    navigation.navigate('Home', { newMatch });
  };

  const clearForm = () => {
    setTeam1('');
    setTeam2('');
    setSport('');
    setTime(createDefaultTime());
  };

  return (
    <View style={styles.root}>
      {/* Верхняя safe-area (ноутч) — белая */}
      <SafeAreaView style={styles.safeTop} />

      {/* Основная safe-area — оранжевый фон до низа */}
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={BACK}
              style={[styles.iconImage, styles.backIcon]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Image source={LOGO} style={styles.logo} resizeMode="contain" />

          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('Settings')}
          >
            <Image
              source={GEAR}
              style={[styles.iconImage, styles.gearIcon]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Body with orange background to the very bottom */}
        <View style={styles.screenBg}>
          <KeyboardAvoidingView
            style={styles.body}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.formCard}>
              <View style={styles.row}>
                <TextInput
                  style={styles.input}
                  placeholder="Team 1"
                  placeholderTextColor={COLORS.textMuted}
                  value={team1}
                  onChangeText={setTeam1}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Team 2"
                  placeholderTextColor={COLORS.textMuted}
                  value={team2}
                  onChangeText={setTeam2}
                />
              </View>

              <View style={[styles.row, { marginTop: 10 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Sport"
                  placeholderTextColor={COLORS.textMuted}
                  value={sport}
                  onChangeText={setSport}
                />
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[styles.input, styles.timeInput]}
                  onPress={() => setIsTimePickerOpen(true)}
                >
                  <Text style={styles.timeText} numberOfLines={1}>
                    {formattedTime}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  activeOpacity={0.9}
                  onPress={handleSave}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.plusBtn}
              activeOpacity={0.9}
              onPress={clearForm}
            >
              <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>

        {/* Time picker modal */}
        <Modal
          transparent
          visible={isTimePickerOpen}
          animationType="fade"
          onRequestClose={() => setIsTimePickerOpen(false)}
        >
          <View style={styles.timeModalBackdrop}>
            <View style={styles.timeModalCard}>
              <DateTimePicker
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                value={time}
                themeVariant="light"
                accentColor="#1A2B38"
                is24Hour={false}
                locale="en_US"
                onChange={(event, selectedDate) => {
                  if (event.type === 'dismissed') {
                    if (Platform.OS !== 'ios') {
                      setIsTimePickerOpen(false);
                    }
                    return;
                  }
                  const newDate = selectedDate || time;
                  setTime(newDate);
                  if (Platform.OS !== 'ios') {
                    setIsTimePickerOpen(false);
                  }
                }}
              />

              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.timeCancelBtn}
                  activeOpacity={0.8}
                  onPress={() => setIsTimePickerOpen(false)}
                >
                  <Text style={styles.timeCancelText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default CreateMatchScreen;

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
  screenBg: {
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
  headerIcon: {
    width: 32,
    alignItems: 'flex-start',
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  backIcon: {
    tintColor: '#1A2B38',
  },
  gearIcon: {
    tintColor: '#1A2B38',
  },
  logo: {
    height: 56,
    width: 220,
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: COLORS.deep,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.white,
    fontSize: 14,
  },
  timeInput: {
    justifyContent: 'center',
  },
  timeText: {
    color: COLORS.white,
    fontSize: 14,
  },
  saveBtn: {
    marginLeft: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  plusBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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

  // time modal
  timeModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeModalCard: {
    width: '80%',
    maxHeight: '50%',
    backgroundColor: '#1A2B38',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  timeModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  timeList: {
    marginTop: 4,
  },
  timeListContent: {
    paddingVertical: 4,
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  timeOptionActive: {
    backgroundColor: '#1A2B38',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  timeOptionTextActive: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeCancelBtn: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#EEE',
  },
  timeCancelText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
});
