import { StyleSheet, Pressable, View, Text, } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>

      <Pressable style={styles.settings}>
        <FontAwesome name="gear" size={40} color="black" />
      </Pressable>

      <View style={styles.user}>
        <FontAwesome name="user-circle" size={170} color="black" />
        <Text style={styles.text}>Sean</Text>
      </View>

      <View style={styles.statsSelection}>

        <Pressable style={styles.button}>
          <Text>Quizzes</Text>  
        </Pressable>

        <View style={styles.divider}></View>

        <Pressable style={styles.button}>
          <Text>Resources</Text>  
        </Pressable>

      </View>
    </View>
  );
}

const changeTabToQuizzes = () => {}
const changeTabToResources = () => {}

const styles = StyleSheet.create({
  settings: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 10,
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  user: {
    marginTop: 10,
    alignItems: 'center'
  },
  text: {
    fontWeight: 'bold',
    fontSize: 35,
    marginTop: 25,
  },
  statsSelection: {
    justifyContent: 'center',
    marginTop: 30,
    flexDirection: 'row',
  },
  button: {

  },
  divider: {
    width: 2,
    height: '100%',
    backgroundColor: '#ccc',
  },
});