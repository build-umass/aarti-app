import { Image, StyleSheet, Platform, View, Text } from 'react-native';

export default function ChatBotScreen() {
  return (
    <View style={styles.container}>
      <Text>This is a chatbot screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});