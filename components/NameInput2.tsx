import React, { useState, useCallback } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';
import { storage } from '@/constants/Storage';

export default function NameInput2() {
  const [username, setusername] = useMMKVString("user.name");
  const [inputText, setInputText] = useState('');

  const onUsernameUpdate = useCallback(() => {
    if (inputText) {
      setusername(inputText);
    }
  }, [inputText, setusername]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={inputText}
        onChangeText={setInputText}
      />
      <Button title="Submit" onPress={onUsernameUpdate} />
      
      <View style={styles.displayContainer}>
        <Text style={styles.label}>Stored Name:</Text>
        <Text style={styles.name}>{username || 'No name stored'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    padding: 10,
    marginBottom: 10,
  },
  displayContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  name: {
    fontSize: 18,
  },
});