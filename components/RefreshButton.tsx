import { Button } from 'react-native';
import * as Updates from 'expo-updates';

// Method 1: Using Expo Updates
const RefreshButton = () => {
  const handleReload = async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error reloading app:', error);
    }
  };

  return <Button title="Reload App" onPress={handleReload} />;
};

export default RefreshButton;