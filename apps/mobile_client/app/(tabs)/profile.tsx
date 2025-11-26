import { StyleSheet, Pressable, View, ScrollView, Text, Dimensions, TouchableOpacity } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import ProgressBar from '../../components/ProgressBar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { UserService } from '@/services/UserService';
import { QuizService } from '@/services/QuizService';
import { appEvents, EVENT_TYPES } from '@/lib/eventEmitter';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import React from 'react';

// TODO:
// fix child key console warning
// fix stats update on profile after quiz
// get topic stats from MMKV
// settings page (store using MMKV)
// resources stats (after resources are uploaded and finalized with categories)

export default function ProfileScreen() {
  const { t } = useAppTranslation('profile');
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'quiz' | 'resource'>('quiz'); // valid options: quiz, resource
  const [username, setUsername] = useState<string>('Loading...');

  // Move all hooks to the top level to follow Rules of Hooks
  const [stats, setStats] = useState<{
    total: number;
    completed: number;
    percentage: number;
  }>({ total: 0, completed: 0, percentage: 0 });

  const [topicStats, setTopicStats] = useState<{ name: string; completed: number; total: number }[]>([]);

  // Function to load all data
  const loadData = useCallback(async () => {
    try {
      console.log('Loading profile data...');
      // Load username
      const userSettings = await UserService.getUserSettings();
      setUsername(userSettings.username);

      // Load quiz stats
      const completionStats = await QuizService.getCompletionStats();
      const allTopics = await QuizService.getTopics();
      setStats(completionStats);

      // Load completion stats for each topic
      const topicStatsData = await Promise.all(
        allTopics.map(async (topic) => {
          const progress = await QuizService.getProgressByTopic(topic.id);
          return {
            name: topic.name,
            completed: progress.completed,
            total: progress.total,
          };
        })
      );
      setTopicStats(topicStatsData);
      console.log('Profile data loaded successfully');
    } catch (error) {
      console.error('Failed to load user data or stats:', error);
      setUsername('User');
    }
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Listen for data updates from other tabs
  useEffect(() => {
    const handleUsernameUpdate = (newUsername: string) => {
      console.log('Username updated event received:', newUsername);
      setUsername(newUsername);
    };

    const handleDataUpdate = () => {
      console.log('Data update event received, reloading...');
      loadData();
    };

    // Subscribe to events
    appEvents.on(EVENT_TYPES.USERNAME_UPDATED, handleUsernameUpdate);
    appEvents.on(EVENT_TYPES.QUIZ_PROGRESS_UPDATED, handleDataUpdate);
    appEvents.on(EVENT_TYPES.BOOKMARKS_UPDATED, handleDataUpdate);
    appEvents.on(EVENT_TYPES.DATA_RESET, handleDataUpdate);

    // Cleanup listeners on unmount
    return () => {
      appEvents.off(EVENT_TYPES.USERNAME_UPDATED, handleUsernameUpdate);
      appEvents.off(EVENT_TYPES.QUIZ_PROGRESS_UPDATED, handleDataUpdate);
      appEvents.off(EVENT_TYPES.BOOKMARKS_UPDATED, handleDataUpdate);
      appEvents.off(EVENT_TYPES.DATA_RESET, handleDataUpdate);
    };
  }, [loadData]);

  return (
    <View style={styles.container}>
      <Pressable style={styles.settings} onPress={() => router.push('./settings' as any)}>
        <FontAwesome name="gear" size={40} color="black" />
      </Pressable>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.user}>
          <FontAwesome name="user-circle" size={170} color="black" />
          <Text style={styles.text}>{username}</Text>
        </View>

        {/* Language Selector */}
        <View style={styles.languageSection}>
          <Text style={styles.languageTitle}>{t('language.title')}</Text>
          <View style={styles.languageButtons}>
            {availableLanguages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  currentLanguage === lang.code && styles.languageButtonActive
                ]}
                onPress={() => changeLanguage(lang.code)}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    currentLanguage === lang.code && styles.languageButtonTextActive
                  ]}
                >
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsSelection}>
          <Pressable
            style={styles.button}
            onPressIn={() => setActiveTab("quiz")}>
            <Text style={[{color: activeTab === 'quiz' ? Colors.light.tint : "black"}, styles.buttonText]}>{t('tabs.quizzes')}</Text>
          </Pressable>

          <View style={styles.divider}></View>

          <Pressable
            style={styles.button}
            onPress={() => setActiveTab("resource")}>
            <Text style={[{color: activeTab === 'resource' ? Colors.light.tint : "black"}, styles.buttonText]}>{t('tabs.resources')}</Text>
          </Pressable>
        </View>

        {renderStats(activeTab, stats, topicStats, t)}
      </ScrollView>
    </View>
  );
}

const renderStats = (
  activeTab: 'quiz' | 'resource',
  stats: { total: number; completed: number; percentage: number },
  topicStats: { name: string; completed: number; total: number }[],
  t: (key: string, params?: any) => string
) => {
  return (
    <View style={styles.statsOutline}>
      {activeTab === 'quiz' ? renderQuizStats(stats, topicStats, t) : renderResourceStats()}
    </View>
  );
};

const renderQuizStats = (
  stats: { total: number; completed: number; percentage: number },
  topicStats: { name: string; completed: number; total: number }[],
  t: (key: string, params?: any) => string
) => {
  return (
    <View style={styles.statsContent}>
      <ProgressBar progressFunc={() => stats.percentage} backgroundColor={"#ffffff"} />
      <Text style={[styles.statsText, {fontWeight:'bold'}]}>
        {t('stats.quizzes_completed', { completed: stats.completed, total: stats.total })}
      </Text>

      <ScrollView style={styles.statsScrollBox} persistentScrollbar={true}>
        {topicStats.map((topic, i) =>
          <Text style={styles.statsText} key={i}>
            • {t('stats.by_topic', { topic: topic.name, completed: topic.completed, total: topic.total })}
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const renderResourceStats = () => {
  return (
    <View style={styles.statsContent}>
      <ProgressBar progressFunc={tempResourceProgress} backgroundColor={"ffffff"} />
      <Text>TODO</Text>
    </View>
  );
};

const calcButtonWidth = () => {
  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = (screenWidth - 50) / 2;
  return buttonWidth;
}

// may need to update these if quiz code changes after connecting to backend
const tempResourceProgress = () => 36;

const totalInTopic = (category: String) => {};
const totalCompletedInTopic = (category: String) => {};

const styles = StyleSheet.create({
  settings: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 10,
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  user: {
    marginTop: 10,
    alignItems: 'center'
  },
  text: {
    fontWeight: 'bold',
    fontSize: 35,
    marginTop: 25,
    textAlign: 'center',
  },
  languageSection: {
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 12,
  },
  statsSelection: {
    justifyContent: 'center',
    marginTop: 20,
    flexDirection: 'row',
  },
  button: {
    width: calcButtonWidth(),
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 24,
  },
  divider: {
    width: 2,
    height: '100%',
    backgroundColor: '#ccc',
  },
  statsOutline: {
    minHeight: 300,
    marginTop: 20,
    marginRight: 20,
    marginLeft: 20,
    marginBottom: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 3,
  },
  statsContent: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 5,
    marginBottom: 10,
  },
  statsText: {
    fontSize: 20,
  },
  statsScrollBox: {
    height: "85%",
    maxHeight: 150,
    marginTop: 3,
  },
  languageButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  languageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minWidth: 100,
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#11181C',
  },
  languageButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});