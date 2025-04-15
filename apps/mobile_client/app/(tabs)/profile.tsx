import { StyleSheet, Pressable, View, ScrollView, Text, Dimensions } from 'react-native';
import { useState } from 'react';
import { Colors } from '@/constants/Colors';
import ProgressBar from '../../components/ProgressBar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { generalQuestionsStorage, quizData } from './quizzes';
import { settingsStorage } from '../_layout';

// TODO:
// get categories from MMKV/storage?
// get stats from MMKV
// dynamic name support
// settings page (store using MMKV)
// resources stats (after resources are uploaded and finalized with categories)

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'quiz' | 'resource'>('quiz'); // valid options: quiz, resource

  return (
    <View style={styles.container}>

      <Pressable style={styles.settings}>
        <FontAwesome name="gear" size={40} color="black" />
      </Pressable>

      <View style={styles.user}>
        <FontAwesome name="user-circle" size={170} color="black" />
        <Text style={styles.text}>{`${settingsStorage.getString("username")}`}</Text>
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
      <ProgressBar progressFunc={tempQuizProgress} backgroundColor={"#ffffff"} />
      <Text style={[styles.statsText, {fontWeight:'bold'}]}>
        Total Questions Completed: 14/200
      </Text>
      
      <ScrollView style={styles.statsScrollBox} persistentScrollbar={true}>
        <Text style={styles.statsText}>• General Knowledge: 5/10</Text>
        <Text style={styles.statsText}>• Science & Nature: 7/9</Text>
        <Text style={styles.statsText}>• History & Politics: 3/5</Text>
        <Text style={styles.statsText}>• Geography: 4/6</Text>
        <Text style={styles.statsText}>• Pop Culture: 6/8</Text>
        <Text style={styles.statsText}>• Literature & Books: 2/4</Text>
        <Text style={styles.statsText}>• Technology & Computing: 5/7</Text>
        <Text style={styles.statsText}>• Movies & TV Shows: 8/10</Text>
        <Text style={styles.statsText}>• Sports & Games: 4/5</Text>
        <Text style={styles.statsText}>• Music & Lyrics: 6/9</Text>
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
const tempQuizProgress = () => 80;
const tempResourceProgress = () => 36;

const totalQuestions = () => quizData.length;

const totalCompleted = () => {
  const completed = generalQuestionsStorage.getString('completedQuestions');
};
const totalInCategory = (category: String) => {};
const totalCompletedInCategory = (category: String) => {};

const getAllCategories = () => [...new Set(quizData.map(quiz => quiz.topic))];

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