import { StyleSheet } from 'react-native';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Bookmark, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Text, View, Pressable, ScrollView } from 'react-native';

const quizData = [
  {
    id: 1,
    title: "Capital Cities",
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris"
  },
  {
    id: 2,
    title: "Solar System",
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars"
  },
  {
    id: 3,
    title: "Basic Math",
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4"
  },
  {
    id: 4,
    title: "Programming",
    question: "Which language is React Native written in?",
    options: ["Python", "Java", "JavaScript", "C++"],
    correctAnswer: "JavaScript"
  },
];

export default function QuizPage() {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  const calculateProgress = () => {
    if (!hasStarted) return 0;
    const totalQuestions = quizData.length;
    const correctAnswers = Object.values(selectedAnswers).filter(
      (answer, index) => answer === quizData[index].correctAnswer
    ).length;
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const handleAnswer = (questionId, selectedOption) => {
    setHasStarted(true);
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Progress section */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {`${calculateProgress()}%`}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${calculateProgress()}%` }]}
            />
          </View>
        </View>

        {/* Questions */}
        {quizData.map((quiz) => (
          <View key={quiz.id} style={styles.questionContainer}>
            <Pressable
              onPress={() => toggleQuestion(quiz.id)}
              style={styles.questionHeader}
            >
              <Text style={styles.questionTitle}>{quiz.title}</Text>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔖</Text>
                <Text style={styles.icon}>
                  {expandedQuestion === quiz.id ? '▲' : '▼'}
                </Text>
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
                        option !== quiz.correctAnswer && styles.incorrectOption
                      ]}
                      onPress={() => handleAnswer(quiz.id, option)}
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
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
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
});