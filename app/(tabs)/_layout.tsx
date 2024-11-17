import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';

const ICON_SIZE = 34;

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: 'black',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title:"",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="home" size={ICON_SIZE} color = {color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title:"",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="book-open" size={ICON_SIZE} color = {color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{
          title:"",
          tabBarIcon: ({ color, focused }) => (
            <Entypo name="graduation-cap" size={ICON_SIZE} color= {color} />
          ),
        }}
      />
      <Tabs.Screen
      name="profile"
      options={{
        title:"",
        tabBarIcon: ({ color, focused }) => (
            <Feather name="user" size={ICON_SIZE} color = {color} />
        ),
      }}
    />
    <Tabs.Screen
        name="chatbot"
        options={{
          title:"",
          tabBarIcon: ({ color, focused }) => (
            <Entypo name="chat" size={ICON_SIZE} color = {color} />
          ),
        }}
      />
    </Tabs>
  );
}
