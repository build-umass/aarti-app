import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTranslation } from '@/hooks/useAppTranslation';

// Define props for InputBar
interface InputBarProps {
  onSend: (text: string) => void;
}

const InputBar: React.FC<InputBarProps> = ({ onSend }) => {
  const { t } = useAppTranslation('chat');
  const [text, setText] = useState('');

  const handleSendPress = () => {
    if (text.trim().length > 0) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <View style={styles.inputBar}>
      <TextInput
        style={styles.textBox}
        value={text}
        onChangeText={setText}
        placeholder={t('input_placeholder')}
        onSubmitEditing={handleSendPress}
      />
      <TouchableOpacity onPress={handleSendPress} style={styles.sendButton}>
        <Ionicons name="send" size={24} color="#EE628C" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBar: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#e5e5ea',
    backgroundColor: '#fff',
  },
  textBox: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default InputBar;
