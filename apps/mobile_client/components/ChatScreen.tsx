import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import { useAppTranslation } from '@/hooks/useAppTranslation';

// Define a Message type
interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const ChatScreen: React.FC = () => {
  const { t } = useAppTranslation('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: t('initial_message'),
      isUser: false,
    },
  ]);

  const handleSend = (text: string) => {
    if (text.length > 0) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: (prevMessages.length + 1).toString(), text, isUser: true },
      ]);

      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: (prevMessages.length + 1).toString(),
            text: t('resources_message'),
            isUser: false,
          },
        ]);
      }, 500);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
      />
      <InputBar onSend={handleSend} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
});

export default ChatScreen;
