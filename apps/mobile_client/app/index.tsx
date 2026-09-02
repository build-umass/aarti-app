import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { UserService } from '@/services/UserService';
import { BrandColors } from '@/constants/Theme';

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const status = await UserService.getOnboardingStatus();
        console.log('Index route: checking onboarding status =', status);
        if (!cancelled) setOnboardingCompleted(status);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to showing onboarding on error
        if (!cancelled) setOnboardingCompleted(false);
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Show loading while checking
  if (isChecking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: BrandColors.primary,
        }}
      >
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  // Redirect based on onboarding status
  console.log('Index route: redirecting to', onboardingCompleted ? '/(tabs)' : '/onboarding');
  return <Redirect href={onboardingCompleted ? '/(tabs)' : '/onboarding'} />;
}
