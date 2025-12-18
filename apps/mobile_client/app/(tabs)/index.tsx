import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather, Entypo } from '@expo/vector-icons';
import { UserService } from '@/services/UserService';
import { QuizService } from '@/services/QuizService';
import { BookmarkService } from '@/services/BookmarkService';
import { useAppInit } from '@/contexts/AppInitContext';
import { appEvents, EVENT_TYPES } from '@/lib/eventEmitter';
import { BrandColors } from '@/constants/Theme';
import { useAppTranslation } from '@/hooks/useAppTranslation';

export default function HomeScreen() {
  const { t } = useAppTranslation('home');
  const { isSeeded } = useAppInit();
  const [username, setUsername] = useState<string>('User');
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    bookmarks: 0,
    completionPercentage: 0,
  });

  const loadData = useCallback(async () => {
    try {
      // Load username
      const userSettings = await UserService.getUserSettings();
      setUsername(userSettings.username);

      // Load stats
      const quizStats = await QuizService.getCompletionStats();
      const bookmarkCount = await BookmarkService.getBookmarkCount();

      setStats({
        totalQuizzes: quizStats.total,
        completedQuizzes: quizStats.completed,
        bookmarks: bookmarkCount,
        completionPercentage: quizStats.percentage,
      });
    } catch (error) {
      console.error('Error loading home screen data:', error);
    }
  }, []);

  // Load initial data when seeded
  useEffect(() => {
    if (!isSeeded) {
      return;
    }
    loadData();
  }, [isSeeded, loadData]);

  // Listen for data updates from other pages
  useEffect(() => {
    const handleUsernameUpdate = (newUsername: string) => {
      setUsername(newUsername);
    };

    const handleDataUpdate = () => {
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

  const navigateToTab = (tabName: string) => {
    router.push(`/(tabs)/${tabName}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>{t('welcome_back')}</Text>
          <Text style={styles.usernameText}>{username}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedQuizzes}</Text>
            <Text style={styles.statLabel}>{t('stats.quizzes_completed')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalQuizzes}</Text>
            <Text style={styles.statLabel}>{t('stats.total_quizzes')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.bookmarks}</Text>
            <Text style={styles.statLabel}>{t('stats.bookmarks')}</Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>{t('progress.title')}</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>{t('progress.overall_completion')}</Text>
              <Text style={styles.progressPercentage}>{stats.completionPercentage}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${stats.completionPercentage}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>{t('explore_title')}</Text>

          {/* Resources Card */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigateToTab('resources')}
            activeOpacity={0.7}
          >
            <View style={[styles.featureIconContainer, { backgroundColor: '#e8f4f8' }]}>
              <Feather name="book-open" size={28} color="#2270CA" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('features.resources.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('features.resources.description')}
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#687076" />
          </TouchableOpacity>

          {/* Quizzes Card */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigateToTab('quizzes')}
            activeOpacity={0.7}
          >
            <View style={[styles.featureIconContainer, { backgroundColor: BrandColors.primaryLight }]}>
              <Entypo name="graduation-cap" size={28} color={BrandColors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('features.quizzes.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('features.quizzes.description')}
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#687076" />
          </TouchableOpacity>

          {/* Chat Card */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigateToTab('chatbot')}
            activeOpacity={0.7}
          >
            <View style={[styles.featureIconContainer, { backgroundColor: '#e8f5e9' }]}>
              <Entypo name="chat" size={28} color="#22c55e" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('features.chat.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('features.chat.description')}
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#687076" />
          </TouchableOpacity>

          {/* Profile Card */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigateToTab('profile')}
            activeOpacity={0.7}
          >
            <View style={[styles.featureIconContainer, { backgroundColor: '#fff4e6' }]}>
              <Feather name="user" size={28} color="#f59e0b" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('features.profile.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('features.profile.description')}
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#687076" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#687076',
    marginBottom: 4,
  },
  usernameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BrandColors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BrandColors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#687076',
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    color: '#11181C',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BrandColors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e5ea',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: BrandColors.primary,
    borderRadius: 4,
  },
  featuresSection: {
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#687076',
    lineHeight: 18,
  },
});