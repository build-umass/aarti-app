import React, { useState, useEffect } from 'react';
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
import { RAGService } from '@/services/RAGService';

// Define a Message type
interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const ChatScreen: React.FC = () => {
  const { t, currentLanguage } = useAppTranslation('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: t('initial_message'),
      isUser: false,
    },
  ]);

  // Update initial message when language changes
  useEffect(() => {
    setMessages([
      {
        id: '0',
        text: t('initial_message'),
        isUser: false,
      },
    ]);
  }, [currentLanguage, t]);

  const handleSend = async (text: string) => {
    if (text.length > 0) {
      // Add user message immediately
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: (prevMessages.length + 1).toString(), text, isUser: true },
      ]);

      try {
        // Generate RAG response
        const response = await RAGService.generateResponse(text);

        // Add bot response
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: (prevMessages.length + 1).toString(),
            text: response,
            isUser: false,
          },
        ]);
      } catch (error) {
        console.error('Error generating response:', error);

        // Fallback response
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: (prevMessages.length + 1).toString(),
            text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
            isUser: false,
          },
        ]);
      }
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
