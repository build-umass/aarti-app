import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import TypingIndicator from './TypingIndicator';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { RAGService } from '@/services/RAGService';

// Define a Message type
interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const ChatScreen: React.FC = () => {
  const { t } = useAppTranslation('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const displayMessages = useMemo<Message[]>(
    () => [{ id: '0', text: t('initial_message'), isUser: false }, ...messages],
    [messages, t]
  );

  // Scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
    if (flatListRef.current && (messages.length > 0 || isLoading)) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (text.length > 0 && !isLoading) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: (prevMessages.length + 1).toString(), text, isUser: true },
      ]);

      setIsLoading(true);

      try {
        const response = await RAGService.generateResponse(text);

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

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: (prevMessages.length + 1).toString(),
            text: t('error_message'),
            isUser: false,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  const renderFooter = () => {
    if (isLoading) {
      return <TypingIndicator />;
    }
    return null;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={displayMessages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        ListFooterComponent={renderFooter}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <InputBar onSend={handleSend} disabled={isLoading} />
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
    flexGrow: 1,
  },
});

export default ChatScreen;
