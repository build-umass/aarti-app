import { NavigationContainer } from "@react-navigation/native";
import { Stack } from "expo-router";
import BottomNavigation from "./components/BottomNavigation";
import { useState } from "react";



const RootLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <Stack>
      <Stack.Screen name="index" />
      <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
    </Stack>
  );
}
