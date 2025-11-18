import { StyleSheet, View, Text, TextInput, Pressable, Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors } from '@/constants/Colors';
import { UserService } from '@/services/UserService';
import { appEvents, EVENT_TYPES } from '@/lib/eventEmitter';

// Web-compatible confirmation dialog
const showConfirmDialog = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText: string = 'OK'
) => {
  if (Platform.OS === 'web') {
    // Use browser's confirm dialog on web
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    // Use native Alert on mobile
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
  }
};

// Web-compatible alert
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function SettingsScreen() {
  const [username, setUsername] = useState<string>('');
  const [originalUsername, setOriginalUsername] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const userSettings = await UserService.getUserSettings();
        setUsername(userSettings.username);
        setOriginalUsername(userSettings.username);
      } catch (error) {
        console.error('Failed to load username:', error);
      }
    };

    loadUsername();
  }, []);

  const handleSaveUsername = async () => {
    if (username.trim() === '') {
      showAlert('Error', 'Username cannot be empty');
      return;
    }

    if (username === originalUsername) {
      showAlert('Info', 'No changes to save');
      return;
    }

    setIsSaving(true);
    try {
      await UserService.updateUsername(username);
      setOriginalUsername(username);
      appEvents.emit(EVENT_TYPES.USERNAME_UPDATED, username);
      showAlert('Success', 'Username updated successfully');
    } catch (error) {
      console.error('Failed to update username:', error);
      showAlert('Error', 'Failed to update username');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetQuizProgress = () => {
    console.log('Reset quiz progress button pressed');
    showConfirmDialog(
      'Reset Quiz Progress',
      'Are you sure you want to reset all quiz progress? This will delete all your quiz answers and completion history. This action cannot be undone.',
      async () => {
        console.log('Reset confirmed, starting deletion...');
        try {
          await UserService.resetQuizProgress();
          console.log('Quiz progress reset successful');
          appEvents.emit(EVENT_TYPES.QUIZ_PROGRESS_UPDATED);
          appEvents.emit(EVENT_TYPES.DATA_RESET);
          showAlert('Success', 'Quiz progress has been reset');
        } catch (error) {
          console.error('Failed to reset quiz progress:', error);
          showAlert('Error', `Failed to reset quiz progress: ${error}`);
        }
      },
      'Reset'
    );
  };

  const handleResetBookmarks = () => {
    console.log('Reset bookmarks button pressed');
    showConfirmDialog(
      'Reset Bookmarks',
      'Are you sure you want to delete all your bookmarks? This action cannot be undone.',
      async () => {
        console.log('Delete confirmed, starting deletion...');
        try {
          await UserService.resetBookmarks();
          console.log('Bookmarks reset successful');
          appEvents.emit(EVENT_TYPES.BOOKMARKS_UPDATED);
          appEvents.emit(EVENT_TYPES.DATA_RESET);
          showAlert('Success', 'Bookmarks have been deleted');
        } catch (error) {
          console.error('Failed to reset bookmarks:', error);
          showAlert('Error', `Failed to reset bookmarks: ${error}`);
        }
      },
      'Delete'
    );
  };

  return (
    <View style={styles.container}>
      {/* Username Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Username</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor="#999"
          />
          <Pressable
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveUsername}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Reset Progress Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <Pressable
          style={styles.dangerButton}
          onPress={handleResetQuizProgress}
        >
          <FontAwesome name="refresh" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.dangerButtonText}>Reset Quiz Progress</Text>
        </Pressable>

        <Pressable
          style={styles.dangerButton}
          onPress={handleResetBookmarks}
        >
          <FontAwesome name="trash" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.dangerButtonText}>Delete All Bookmarks</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#ff3b30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
