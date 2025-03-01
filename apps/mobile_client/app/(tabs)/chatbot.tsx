import React from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import ChatScreen from '../../components/ChatScreen';

export default function ChatBotScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ChatScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});