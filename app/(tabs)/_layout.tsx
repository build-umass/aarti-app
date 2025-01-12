import { Tabs } from 'expo-router';
import { Image, View, Text, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';

const ICON_SIZE = 29;

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: 'black',
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#CCCCCC',
          borderTopWidth: 0,
          height: 85,
          paddingBottom: 0,
          paddingTop: 10,
        },
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={ICON_SIZE} color = {color} />
          ),
          header: () => (
            <View style={styles.customHeader}>
              <Text style={styles.headerText}>Home</Text>
              <Image 
                source={require('../../assets/images/aarti-logo.png')}
                style={styles.logo}
              />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          tabBarLabel: "Resources",
          tabBarIcon: ({ color }) => (
            <Feather name="book-open" size={ICON_SIZE} color = {color} />
          ),
          header: () => (
            <View style={styles.customHeader}>
              <Text style={styles.headerText}>Resources</Text>
              <Image 
                source={require('../../assets/images/aarti-logo.png')}
                style={styles.logo}
              />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{
          tabBarLabel: "Quizzes",
          tabBarIcon: ({ color }) => (
            <Entypo name="graduation-cap" size={ICON_SIZE} color= {color} />
          ),
          header: () => (
            <View style={styles.customHeader}>
              <Text style={styles.headerText}>Quizzes</Text>
              <Image 
                source={require('../../assets/images/aarti-logo.png')}
                style={styles.logo}
              />
            </View>
          )
        }}
      />
      <Tabs.Screen
      name="profile"
      options={{
        tabBarLabel: "Profile",
        tabBarIcon: ({ color }) => (
            <Feather name="user" size={ICON_SIZE} color = {color} />
        ),
        header: () => (
          <View style={styles.customHeader}>
            <Text style={styles.headerText}>Profile</Text>
            <Image 
              source={require('../../assets/images/aarti-logo.png')}
              style={styles.logo}
            />
          </View>
        )
      }}
    />
    <Tabs.Screen
        name="chatbot"
        options={{
          tabBarLabel: "Chat",
          tabBarIcon: ({ color }) => (
            <Entypo name="chat" size={ICON_SIZE} color = {color} />
          ),
          header: () => (
            <View style={styles.customHeader}>
              <Text style={styles.headerText}>Chat</Text>
              <Image 
                source={require('../../assets/images/aarti-logo.png')}
                style={styles.logo}
              />
            </View>
          )
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
    backgroundColor: '#5f2446',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  logo: {
    width: 120,
    height: 70,
    marginRight: 10,
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
  },
});