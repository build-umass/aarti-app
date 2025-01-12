import React from 'react';
import { useState } from 'react';
import { StyleSheet, ViewStyle, TextStyle, Text, View, Pressable, ScrollView, PressableStateCallbackType } from 'react-native';
import { Bookmark as BookmarkIcon } from 'lucide-react-native';
import { MMKV } from 'react-native-mmkv';

interface QuizItem {
  id: number;
  topic: string;
  title: string;
  question: string;
  options: string[];
  correctAnswer: string;
  feedback: string;
}

interface SelectedAnswers {
  [key: number]: string;
}

interface BookmarkedQuestions {
  [key: number]: boolean;
}

const quizData: QuizItem[] = [
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

interface ShadowOffset {
  width: number;
  height: number;
}

interface ViewStyleWithShadow extends ViewStyle {
  shadowOffset?: ShadowOffset;
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

interface ViewStyleWithGap extends ViewStyle {
  gap?: number;
}

interface ViewStyleWithBorder extends ViewStyle {
  borderLeftWidth?: number;
  borderLeftColor?: string;
}

// Initialize MMKV storage specifically for bookmarked questions
const bookmarkedQuestionsStorage = new MMKV();
// Add new MMKV storage for general questions progress
const generalQuestionsStorage = new MMKV();

// Add this new function to load selected answers from storage
const loadSelectedAnswers = () => {
  const storedAnswers = generalQuestionsStorage.getString('selectedAnswers');
  return storedAnswers ? JSON.parse(storedAnswers) : {};
};

export default function QuizPage() {
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>(loadSelectedAnswers());
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');

  // Load completed questions from storage
  const loadCompletedQuestions = (): Set<number> => {
    const storedProgress = generalQuestionsStorage.getString('completedQuestions');
    const storedTopicProgress = generalQuestionsStorage.getString(`completedQuestions_${selectedTopic}`);
    
    if (selectedTopic === 'All' || selectedTopic === 'Bookmarked') {
      return storedProgress ? new Set(JSON.parse(storedProgress)) : new Set();
    }
    return storedTopicProgress ? new Set(JSON.parse(storedTopicProgress)) : new Set();
  };

  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(loadCompletedQuestions());

  // Update storage when completed questions change
  const updateCompletedQuestionsStorage = (newCompletedQuestions: Set<number>) => {
    // Store overall progress
    generalQuestionsStorage.set('completedQuestions', JSON.stringify([...newCompletedQuestions]));
    
    // Store topic-specific progress
    if (selectedTopic !== 'All' && selectedTopic !== 'Bookmarked') {
      generalQuestionsStorage.set(
        `completedQuestions_${selectedTopic}`, 
        JSON.stringify([...newCompletedQuestions])
      );
    }
  };

  // Load bookmarked questions from the dedicated storage
  const loadBookmarkedQuestions = (): BookmarkedQuestions => {
    const storedBookmarks = bookmarkedQuestionsStorage.getString('bookmarkedQuestions');
    return storedBookmarks ? JSON.parse(storedBookmarks) : {};
  };

  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<BookmarkedQuestions>(loadBookmarkedQuestions());

  const topics: string[] = ['All', 'Bookmarked', ...new Set(quizData.map(quiz => quiz.topic))];

  const filteredQuizData: QuizItem[] = React.useMemo(() => {
    if (selectedTopic === 'All') {
      return quizData;
    }
    if (selectedTopic === 'Bookmarked') {
      return quizData.filter(quiz => bookmarkedQuestions[quiz.id]);
    }
    return quizData.filter(quiz => quiz.topic === selectedTopic);
  }, [selectedTopic, bookmarkedQuestions]);

  const calculateProgress = () => {
    if (!hasStarted && calculateCompletion() === 0) return 0;
    const relevantQuestions = filteredQuizData;
    const totalQuestions = relevantQuestions.length;
    if (totalQuestions === 0) return 0;
    
    const correctAnswers = relevantQuestions.filter(
      quiz => selectedAnswers[quiz.id] === quiz.correctAnswer
    ).length;
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const calculateCompletion = () => {
    const relevantQuestions = filteredQuizData;
    const totalQuestions = relevantQuestions.length;
    if (totalQuestions === 0) return 0;
    
    const completed = relevantQuestions.filter(quiz => completedQuestions.has(quiz.id)).length;
    return Math.round((completed / totalQuestions) * 100);
  };

  const getCompletedCount = () => {
    const relevantQuestions = filteredQuizData;
    return relevantQuestions.filter(quiz => completedQuestions.has(quiz.id)).length;
  };

  const handleAnswer = (questionId: number, selectedOption: string): void => {
    if (!completedQuestions.has(questionId)) {
      setHasStarted(true);
      const newSelectedAnswers = {
        ...selectedAnswers,
        [questionId]: selectedOption
      };
      setSelectedAnswers(newSelectedAnswers);
      generalQuestionsStorage.set('selectedAnswers', JSON.stringify(newSelectedAnswers));
      
      const newCompletedQuestions = new Set([...completedQuestions, questionId]);
      setCompletedQuestions(newCompletedQuestions);
      updateCompletedQuestionsStorage(newCompletedQuestions);
    } else if (calculateCompletion() === 100) {
      const newSelectedAnswers = {
        ...selectedAnswers,
        [questionId]: selectedOption
      };
      setSelectedAnswers(newSelectedAnswers);
      generalQuestionsStorage.set('selectedAnswers', JSON.stringify(newSelectedAnswers));
    }
  };

  const toggleQuestion = (questionId: number): void => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const toggleBookmark = (questionId: number): void => {
    const updatedBookmarks = {
      ...bookmarkedQuestions,
      [questionId]: !bookmarkedQuestions[questionId]
    };
    setBookmarkedQuestions(updatedBookmarks);
    // Save updated bookmarks to the dedicated MMKV storage
    bookmarkedQuestionsStorage.set('bookmarkedQuestions', JSON.stringify(updatedBookmarks));
  };

  // Update completedQuestions when topic changes
  React.useEffect(() => {
    setCompletedQuestions(loadCompletedQuestions());
  }, [selectedTopic]);

  // Add effect to update hasStarted based on completion
  React.useEffect(() => {
    if (calculateCompletion() > 0) {
      setHasStarted(true);
    }
  }, [selectedTopic]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
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

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {calculateProgress()}%
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${calculateProgress()}%` } as ViewStyle
              ]}
            />
          </View>
        </View>

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

        {filteredQuizData.map((quiz) => (
          <View key={quiz.id} style={styles.questionContainer}>
            <Pressable
              onPress={() => toggleQuestion(quiz.id)}
              style={styles.questionHeader}
            >
              <Text style={styles.questionTitle}>{quiz.title}</Text>
              <View style={styles.iconContainer}>
                <Pressable 
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleBookmark(quiz.id);
                  }}
                  hitSlop={8}
                >
                  <BookmarkIcon 
                    size={20} 
                    color={bookmarkedQuestions[quiz.id] ? '#fbbf24' : '#9ca3af'}
                    fill={bookmarkedQuestions[quiz.id] ? '#fbbf24' : 'transparent'}
                  />
                </Pressable>
              </View>
            </Pressable>
            
            {expandedQuestion === quiz.id && (
              <View style={styles.questionContent}>
                <Text style={styles.questionText}>{quiz.question}</Text>
                <View style={styles.optionsContainer}>
                  {quiz.options.map((option, index) => (
                    <Pressable
                      key={index}
                      style={({ pressed }: PressableStateCallbackType): ViewStyle[] => [
                        styles.optionButton,
                        selectedAnswers[quiz.id] && option === quiz.correctAnswer ? styles.correctOption : undefined,
                        selectedAnswers[quiz.id] === option && 
                        option !== quiz.correctAnswer ? styles.incorrectOption : undefined,
                        (!completedQuestions.has(quiz.id) || calculateCompletion() === 100) 
                          ? undefined 
                          : styles.disabledOption
                      ].filter((style): style is ViewStyle => style !== undefined)}
                      onPress={() => handleAnswer(quiz.id, option)}
                      disabled={completedQuestions.has(quiz.id) && calculateCompletion() !== 100}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                      {selectedAnswers[quiz.id] && (
                        <React.Fragment>
                          {option === quiz.correctAnswer && (
                            <Text style={[styles.icon, styles.correctIcon]}>✓</Text>
                          )}
                          {selectedAnswers[quiz.id] === option && 
                           option !== quiz.correctAnswer && (
                            <Text style={[styles.icon, styles.incorrectIcon]}>✗</Text>
                          )}
                        </React.Fragment>
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

        
      </View>
    </ScrollView>
  );
}

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  progressContainer: ViewStyle;
  progressText: TextStyle;
  progressBar: ViewStyle;
  progressFill: ViewStyle & { width?: string | number };
  questionContainer: ViewStyle;
  questionHeader: ViewStyleWithShadow;
  questionTitle: TextStyle & { fontWeight: '500' };
  iconContainer: ViewStyle;
  icon: TextStyle;
  questionContent: ViewStyleWithShadow;
  questionText: TextStyle;
  optionsContainer: ViewStyleWithGap;
  optionButton: ViewStyle;
  correctOption: ViewStyle;
  incorrectOption: ViewStyle;
  optionText: TextStyle;
  backButton: ViewStyleWithShadow;
  checkButton: ViewStyle;
  checkButtonText: TextStyle & { fontWeight: '500' };
  correctIcon: TextStyle & { fontWeight: 'bold' };
  incorrectIcon: TextStyle & { fontWeight: 'bold' };
  feedbackContainer: ViewStyleWithBorder;
  feedbackText: TextStyle;
  topicSelectorContainer: ViewStyle;
  topicLabel: TextStyle;
  topicScroll: ViewStyle;
  topicButton: ViewStyle;
  selectedTopicButton: ViewStyle;
  topicButtonText: TextStyle & { fontWeight: '500' };
  selectedTopicButtonText: TextStyle;
  completionContainer: ViewStyleWithShadow;
  completionText: TextStyle & { fontWeight: '500' };
  completionNote: TextStyle;
  disabledOption: ViewStyle;
  bookmarkButton: ViewStyle;
  bookmarkedIcon: TextStyle;
  bookmarkedSection: ViewStyle;
  sectionTitle: TextStyle & { fontWeight: '600' };
  bookmarkedItem: ViewStyleWithShadow;
  bookmarkedTitle: TextStyle & { fontWeight: '500' };
  bookmarkedQuestion: TextStyle;
}

const styles = StyleSheet.create<Styles>({
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
  bookmarkButton: {
    padding: 8,
  },
  bookmarkedIcon: {
    color: '#fbbf24',
  },
  bookmarkedSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  bookmarkedItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  bookmarkedTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  bookmarkedQuestion: {
    fontSize: 14,
    color: '#6b7280',
  },
});