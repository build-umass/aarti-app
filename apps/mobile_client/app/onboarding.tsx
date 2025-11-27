import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { UserService } from '../services/UserService';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Feather, Entypo } from '@expo/vector-icons';

export default function OnboardingScreen() {
  const { t } = useAppTranslation('onboarding');
  const [username, setUsername] = useState('');

  const handleGetStarted = async () => {
    // Validate username input
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      Alert.alert(t('alerts.name_required_title'), t('alerts.name_required_message'));
      return;
    }

    try {
      // Save the username first
      await UserService.updateUsername(trimmedUsername);
      // Then mark onboarding as completed
      await UserService.setOnboardingCompleted();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert(t('alerts.error_title'), t('alerts.error_message'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/aarti-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>{t('welcome_title')}</Text>
          <Text style={styles.welcomeSubtitle}>
            {t('welcome_subtitle')}
          </Text>
        </View>

        {/* Name Input Section */}
        <View style={styles.nameInputSection}>
          <Text style={styles.nameInputLabel}>{t('name_input_label')}</Text>
          <TextInput
            style={styles.nameInput}
            placeholder={t('name_input_placeholder')}
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={50}
          />
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.getStartedButtonText}>{t('get_started_button')}</Text>
        </TouchableOpacity>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>{t('features_title')}</Text>

          {/* Feature Cards */}
          <View style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Feather name="book-open" size={28} color="#5f2446" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('features.resources.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('features.resources.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Entypo name="graduation-cap" size={28} color="#5f2446" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('features.quizzes.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('features.quizzes.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Entypo name="chat" size={28} color="#5f2446" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('features.chat.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('features.chat.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Feather name="user" size={28} color="#5f2446" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('features.profile.title')}</Text>
              <Text style={styles.featureDescription}>
                {t('features.profile.description')}
              </Text>
            </View>
          </View>
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
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5f2446',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#687076',
    textAlign: 'center',
  },
  featuresContainer: {
    marginTop: 40,
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0e6ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#687076',
    lineHeight: 20,
  },
  nameInputSection: {
    marginTop: 30,
    marginBottom: 10,
  },
  nameInputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 12,
    textAlign: 'center',
  },
  nameInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#11181C',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  getStartedButton: {
    backgroundColor: '#5f2446',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#5f2446',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
