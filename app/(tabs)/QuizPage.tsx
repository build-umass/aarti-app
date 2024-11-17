import { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { Text, View, Pressable, ScrollView } from 'react-native';

const quizData = [
  {
    id: 1,
    topic: "Geography",
    title: "Capital Cities",
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
    feedback: "Paris is the capital and largest city of France, known for its iconic Eiffel Tower and rich cultural heritage."
  },
  {
    id: 2,
    topic: "Science",
    title: "Solar System",
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars",
    feedback: "Mars appears red because of iron oxide (rust) on its surface, earning it the nickname 'The Red Planet'."
  },
  {
    id: 3,
    topic: "Mathematics",
    title: "Basic Math",
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
    feedback: "2 + 2 = 4 is one of the most basic arithmetic equations in mathematics."
  },
  {
    id: 4,
    topic: "Technology",
    title: "Programming",
    question: "Which language is React Native written in?",
    options: ["Python", "Java", "JavaScript", "C++"],
    correctAnswer: "JavaScript",
    feedback: "React Native is written in JavaScript and allows developers to build mobile apps using JavaScript and React."
  },
];

export default function QuizPage() {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [completedQuestions, setCompletedQuestions] = useState(new Set());

  const topics = ['All', ...new Set(quizData.map(quiz => quiz.topic))];

  const filteredQuizData = selectedTopic === 'All' 
    ? quizData 
    : quizData.filter(quiz => quiz.topic === selectedTopic);

  const calculateProgress = () => {
    if (!hasStarted) return 0;
    const relevantQuestions = filteredQuizData;
    const totalQuestions = relevantQuestions.length;
    const correctAnswers = relevantQuestions.filter(
      quiz => selectedAnswers[quiz.id] === quiz.correctAnswer
    ).length;
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const calculateCompletion = () => {
    const relevantQuestions = filteredQuizData;
    const totalQuestions = relevantQuestions.length;
    const completed = relevantQuestions.filter(quiz => completedQuestions.has(quiz.id)).length;
    return Math.round((completed / totalQuestions) * 100);
  };

  const getCompletedCount = () => {
    const relevantQuestions = filteredQuizData;
    return relevantQuestions.filter(quiz => completedQuestions.has(quiz.id)).length;
  };

  const handleAnswer = (questionId, selectedOption) => {
    if (!completedQuestions.has(questionId)) {
      setHasStarted(true);
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: selectedOption
      }));
      setCompletedQuestions(prev => new Set([...prev, questionId]));
    } else if (calculateCompletion() === 100) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: selectedOption
      }));
    }
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Add Topic Selector */}
        <View style={styles.topicSelectorContainer}>
          <Text style={styles.topicLabel}>Select Topic:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.topicScroll}
          >
            {topics.map((topic) => (
              <Pressable
                key={topic}
                style={[
                  styles.topicButton,
                  selectedTopic === topic && styles.selectedTopicButton
                ]}
                onPress={() => setSelectedTopic(topic)}
              >
                <Text style={[
                  styles.topicButtonText,
                  selectedTopic === topic && styles.selectedTopicButtonText
                ]}>
                  {topic}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Modified Progress section */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {calculateProgress()}%
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${calculateProgress()}%` }
              ]}
            />
          </View>
        </View>

        {/* Modified completion status */}
        <View style={styles.completionContainer}>
          <Text style={styles.completionText}>
            Questions completed: {getCompletedCount()}/{filteredQuizData.length}
          </Text>
          {calculateCompletion() === 100 && (
            <Text style={styles.completionNote}>
              You can now review and change your answers
            </Text>
          )}
        </View>

        {/* Questions - now using filteredQuizData */}
        {filteredQuizData.map((quiz) => (
          <View key={quiz.id} style={styles.questionContainer}>
            <Pressable
              onPress={() => toggleQuestion(quiz.id)}
              style={styles.questionHeader}
            >
              <Text style={styles.questionTitle}>{quiz.title}</Text>
              <View style={styles.iconContainer}>
                <Bookmark size={20} color="#9ca3af" />
              </View>
            </Pressable>
            
            {expandedQuestion === quiz.id && (
              <View style={styles.questionContent}>
                <Text style={styles.questionText}>{quiz.question}</Text>
                <View style={styles.optionsContainer}>
                  {quiz.options.map((option, index) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.optionButton,
                        selectedAnswers[quiz.id] && option === quiz.correctAnswer && styles.correctOption,
                        selectedAnswers[quiz.id] === option && 
                        option !== quiz.correctAnswer && styles.incorrectOption,
                        !completedQuestions.has(quiz.id) || calculateCompletion() === 100 
                          ? null 
                          : styles.disabledOption
                      ]}
                      onPress={() => handleAnswer(quiz.id, option)}
                      disabled={completedQuestions.has(quiz.id) && calculateCompletion() !== 100}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                      {selectedAnswers[quiz.id] && (
                        <>
                          {option === quiz.correctAnswer && (
                            <Text style={[styles.icon, styles.correctIcon]}>✓</Text>
                          )}
                          {selectedAnswers[quiz.id] === option && 
                           option !== quiz.correctAnswer && (
                            <Text style={[styles.icon, styles.incorrectIcon]}>✗</Text>
                          )}
                        </>
                      )}
                    </Pressable>
                  ))}
                </View>
                
                {selectedAnswers[quiz.id] && (
                  <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackText}>{quiz.feedback}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}

        {/* Back button */}
        <Pressable style={styles.backButton}>
          <Text style={styles.icon}>←</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    maxWidth: 672,
    alignSelf: 'center',
    width: '100%',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 24,
    marginRight: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  questionContainer: {
    marginBottom: 12,
  },
  questionHeader: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  questionTitle: {
    fontWeight: '500',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginHorizontal: 4,
    color: '#9ca3af',
  },
  questionContent: {
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  questionText: {
    color: '#1f2937',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  correctOption: {
    backgroundColor: '#dcfce7',
  },
  incorrectOption: {
    backgroundColor: '#fee2e2',
  },
  optionText: {
    color: '#374151',
  },
  backButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    padding: 8,
    borderRadius: 9999,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  checkButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  correctIcon: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  incorrectIcon: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  feedbackContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  feedbackText: {
    color: '#1e293b',
    fontSize: 14,
    lineHeight: 20,
  },
  topicSelectorContainer: {
    marginBottom: 20,
  },
  topicLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  topicScroll: {
    flexGrow: 0,
  },
  topicButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedTopicButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  topicButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  selectedTopicButtonText: {
    color: 'white',
  },
  completionContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  completionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  completionNote: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  disabledOption: {
    opacity: 0.7,
  },
});