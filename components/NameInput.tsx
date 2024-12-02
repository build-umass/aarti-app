import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { storage } from '@/constants/Storage';

export default function NameInput() {
  const [inputName, setInputName] = useState('');
  const [storedName, setStoredName] = useState('');

  // Load the stored name when component mounts
  useEffect(() => {
    const savedName = storage.getString('userName');
    if (savedName) {
      setStoredName(savedName);
    }
  }, []);

  const handleSubmit = () => {
    if (inputName.trim()) {
      // Save to MMKV storage
      storage.set('userName', inputName);
      // Update the displayed name
      setStoredName(inputName);
      // Clear input field
      setInputName('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={inputName}
        onChangeText={setInputName}
        placeholder="Enter your name"
      />
      <Button title="Submit" onPress={handleSubmit} />
      
      <View style={styles.displayContainer}>
        <Text style={styles.label}>Stored Name:</Text>
        <Text style={styles.name}>{storedName || 'No name stored'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
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