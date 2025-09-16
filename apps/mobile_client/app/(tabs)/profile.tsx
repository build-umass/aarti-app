import { StyleSheet, Pressable, View, ScrollView, Text, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import ProgressBar from '../../components/ProgressBar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getGeneralQuestionsStorage, quizData } from './quizzes';
import { getSettingsStorage } from '../_layout';

// TODO:
// fix child key console warning
// fix stats update on profile after quiz
// get topic stats from MMKV
// settings page (store using MMKV)
// resources stats (after resources are uploaded and finalized with categories)

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'quiz' | 'resource'>('quiz'); // valid options: quiz, resource
  const [username, setUsername] = useState<string>('Loading...');

  useEffect(() => {
    // Load username from storage
    const storage = getSettingsStorage();
    const storedUsername = storage.getString("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <View style={styles.container}>

      <Pressable style={styles.settings}>
        <FontAwesome name="gear" size={40} color="black" />
      </Pressable>

      <View style={styles.user}>
        <FontAwesome name="user-circle" size={170} color="black" />
        <Text style={styles.text}>{username}</Text>
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
    <View style={styles.statsOutline}>
      {activeTab === 'quiz' ? renderQuizStats() : renderResourceStats()}
    </View>
  );
};

const renderQuizStats = () => {
  // get overall progress
  // get categories
  // get progress per category

  return (
    <View style={styles.statsContent}>
      <ProgressBar progressFunc={totalPercentage} backgroundColor={"#ffffff"} />
      <Text style={[styles.statsText, {fontWeight:'bold'}]}>
        Total Questions Completed: {totalCompleted()}/{totalQuestions()}
      </Text>
      
      <ScrollView style={styles.statsScrollBox} persistentScrollbar={true}>
        {getAllTopics().map((topic, i) => 
          <Text style={styles.statsText} key={i}>• {topic}: 0/0</Text>
        )}
      </ScrollView>
    </View>
  );
};

const renderResourceStats = () => {
  return (
    <View style={styles.statsContent}>
      <ProgressBar progressFunc={tempResourceProgress} backgroundColor={"ffffff"} />
      <Text>TODO</Text>
    </View>
  );
};

const calcButtonWidth = () => {
  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = (screenWidth - 50) / 2;
  return buttonWidth;
}

// may need to update these if quiz code changes after connecting to backend
const tempResourceProgress = () => 36;

const totalQuestions = () => quizData.length;
const totalCompleted = () => {
  const storage = getGeneralQuestionsStorage();
  const completed = storage.getString('completedQuestions');
  if (completed) return JSON.parse(completed).length;
  else return 0;
};
const totalPercentage = () => (totalCompleted() / totalQuestions())*100;
const totalInTopic = (category: String) => {};
const totalCompletedInTopic = (category: String) => {};

const getAllTopics = () => [...new Set(quizData.map(quiz => quiz.topic))];

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
    width: calcButtonWidth(),
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
  statsOutline: {
    flex: 1,
    marginTop: 20,
    marginRight: 20,
    marginLeft: 20,
    marginBottom: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 3,
  },
  statsContent: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 5,
    marginBottom: 10,
  },
  statsText: {
    fontSize: 20,
  },
  statsScrollBox: {
    height: "85%",
    marginTop: 3,
  },
});