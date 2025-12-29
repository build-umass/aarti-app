import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTranslation } from '@/hooks/useAppTranslation';

// Define props for InputBar
interface InputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSend, disabled = false }) => {
  const { t } = useAppTranslation('chat');
  const [text, setText] = useState('');

  const handleSendPress = () => {
    if (text.trim().length > 0 && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <View style={styles.inputBar}>
      <TextInput
        style={[styles.textBox, disabled && styles.textBoxDisabled]}
        value={text}
        onChangeText={setText}
        placeholder={disabled ? t('thinking_placeholder') : t('input_placeholder')}
        onSubmitEditing={handleSendPress}
        editable={!disabled}
        placeholderTextColor={disabled ? '#999' : '#888'}
      />
      <TouchableOpacity
        onPress={handleSendPress}
        style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
        disabled={disabled}
      >
        <Ionicons
          name="send"
          size={24}
          color={disabled ? '#ccc' : '#EE628C'}
        />
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
    paddingVertical: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    fontSize: 16,
  },
  textBoxDisabled: {
    backgroundColor: '#f8f8f8',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default InputBar;
