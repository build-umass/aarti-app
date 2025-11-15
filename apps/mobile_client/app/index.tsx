import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { UserService } from '@/services/UserService';

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const status = await UserService.getOnboardingStatus();
      console.log('Index route: checking onboarding status =', status);
      setOnboardingCompleted(status);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to showing onboarding on error
      setOnboardingCompleted(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Show loading while checking
  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#5f2446' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  // Redirect based on onboarding status
  console.log('Index route: redirecting to', onboardingCompleted ? '/(tabs)' : '/onboarding');
  return <Redirect href={onboardingCompleted ? '/(tabs)' : '/onboarding'} />;
}
