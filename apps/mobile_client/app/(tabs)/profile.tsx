import { Image, StyleSheet, Platform, View, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.user}>
        <FontAwesome name="user-circle" size={170} color="black" />
        <Text style={styles.text}>Sean</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  user: {
    marginTop: 60,
    alignItems: 'center'
  },
  text: {
    fontWeight: 'bold',
    fontSize: 35,
    marginTop: 25,
  },
});