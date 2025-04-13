import { StyleSheet, Pressable, View, Text } from 'react-native';
import { useState } from 'react';
import { Colors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// TODO:
// stats module
// dynamic name support
// settings page

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('quiz'); // valid options: quiz, resource

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

        <Pressable 
          style={styles.button}
          onPressIn={() => setActiveTab("quiz")}>
          <Text style={[{color: activeTab === 'quiz' ? Colors.light.tint : "black"}, styles.buttonText]}>Quizzes</Text>  
        </Pressable>

        <View style={styles.divider}></View>

        <Pressable 
          style={styles.button}
          onPress={() => setActiveTab("resource")}>
          <Text style={[{color: activeTab === 'resource' ? Colors.light.tint : "black"}, styles.buttonText]}>Resources</Text>  
        </Pressable>
      </View>

      {renderStats(activeTab)}

    </View>
  );
}

const renderStats = (activeTab: 'quiz' | 'resource') => {
  return (
    <View style={styles.statsModule}>
      {activeTab === 'quiz' ? renderQuizStats() : renderResourceStats()}
    </View>
  );
};

const renderQuizStats = () => {
  return (
    <Text>quiz</Text>
  );
};

const renderResourceStats = () => {
  return (
    <Text>resource</Text>
  );
};

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
    textAlign: 'center',
  },
  statsSelection: {
    justifyContent: 'center',
    marginTop: 30,
    flexDirection: 'row',
  },
  button: {
    width: 200,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 24,
  },
  divider: {
    width: 2,
    height: '100%',
    backgroundColor: '#ccc',
  },
  statsModule: {
    flex: 1,
    marginTop: 20,
    marginRight: 20,
    marginLeft: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#CCCCCC',
  }
});