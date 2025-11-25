import { Tabs } from 'expo-router';
import { Image, View, Text, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const ICON_SIZE = 29;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useAppTranslation('navigation');

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
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={ICON_SIZE} color = {color} />
          ),
          header: () => (
            <View style={styles.customHeader}>
              <Text style={styles.headerText}>{t('headers.home')}</Text>
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
          tabBarLabel: t('tabs.resources'),
          tabBarIcon: ({ color }) => (
            <Feather name="book-open" size={ICON_SIZE} color = {color} />
          ),
          header: () => (
            <View style={styles.customHeader}>
              <Text style={styles.headerText}>{t('headers.resources')}</Text>
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
          tabBarLabel: t('tabs.quizzes'),
          tabBarIcon: ({ color }) => (
            <Entypo name="graduation-cap" size={ICON_SIZE} color= {color} />
          ),
          header: () => (
            <View style={styles.customHeader}>
              <Text style={styles.headerText}>{t('headers.quizzes')}</Text>
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
          tabBarLabel: t('tabs.chat'),
          tabBarIcon: ({ color }) => (
            <Entypo name="chat" size={ICON_SIZE} color = {color} />
          ),
          header: () => (
            <View style={styles.customHeader}>
              <Text style={styles.headerText}>{t('headers.chat')}</Text>
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
        tabBarLabel: t('tabs.profile'),
        tabBarIcon: ({ color }) => (
            <Feather name="user" size={ICON_SIZE} color = {color} />
        ),
        header: () => (
          <View style={styles.customHeader}>
            <Text style={styles.headerText}>{t('headers.profile')}</Text>
            <Image
              source={require('../../assets/images/aarti-logo.png')}
              style={styles.logo}
            />
          </View>
        )
      }}
    />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: t('tabs.settings'),
          tabBarIcon: ({ color }) => (
            <FontAwesome name="gear" size={ICON_SIZE} color={color} />
          ),
          header: () => (
            <View style={styles.customHeader}>
              <Text style={styles.headerText}>{t('headers.settings')}</Text>
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