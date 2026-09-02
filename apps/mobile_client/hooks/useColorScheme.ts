import { useColorScheme as useRNColorScheme } from 'react-native';

// Normalizes RN's ColorSchemeName ('unspecified'/null) to a value that indexes Colors.
export function useColorScheme(): 'light' | 'dark' {
  return useRNColorScheme() === 'dark' ? 'dark' : 'light';
}
