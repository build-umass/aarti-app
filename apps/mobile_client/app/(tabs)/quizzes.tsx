import React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, ViewStyle, TextStyle, Text, View, Pressable, ScrollView, PressableStateCallbackType } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { QuizItem } from '../../../../types';
import ProgressBar from '@/components/ProgressBar';
import { QuizService } from '@/services/QuizService';
import { BookmarkService } from '@/services/BookmarkService';

interface SelectedAnswers {
  [key: number]: string;
}

interface BookmarkedQuestions {
  [key: number]: boolean;
}

// Quiz data will be loaded from SQLite database

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

// SQLite services using raw SQL are imported above

export default function QuizPage() {
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<BookmarkedQuestions>({});
  const [quizData, setQuizData] = useState<QuizItem[]>([]);
  const [topics, setTopics] = useState<string[]>(['All', 'Bookmarked']);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load quiz data from database
        const questions = await QuizService.getQuizQuestions();
        const formattedQuestions: QuizItem[] = questions.map(q => ({
          id: q.id,
          topic: '', // We'll get this from topics table
          title: q.title,
          question: q.question,
          options: JSON.parse(q.options),
          correctAnswer: q.correct_answer,
          feedback: q.feedback
        }));
        
        // Load topics and map them to questions
        const topicData = await QuizService.getTopics();
        const topicMap = new Map(topicData.map(t => [t.id, t.name]));
        
        // Update questions with topic names
        formattedQuestions.forEach(q => {
          const question = questions.find(qu => qu.id === q.id);
          if (question) {
            q.topic = topicMap.get(question.topic_id) || '';
          }
        });
        
        setQuizData(formattedQuestions);
        
        // Load topics
        setTopics(['All', 'Bookmarked', ...topicData.map(t => t.name)]);
        
        // Load selected answers
        const answers = await QuizService.getSelectedAnswers();
        setSelectedAnswers(answers);
        
        // Load completed questions
        const completed = await QuizService.getCompletedQuestions();
        setCompletedQuestions(new Set(completed));
        
        // Load bookmarks
        const bookmarkIds = await BookmarkService.getBookmarkedQuestionIds();
        const bookmarks: BookmarkedQuestions = {};
        bookmarkIds.forEach(id => {
          bookmarks[id] = true;
        });
        setBookmarkedQuestions(bookmarks);
        
        // Check if user has started
        if (completed.length > 0) {
          setHasStarted(true);
        }
        
      } catch (error) {
        console.error('Failed to load quiz data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Update data when topic changes
  useEffect(() => {
    const loadTopicData = async () => {
      try {
        let completed: number[] = [];
        
        if (selectedTopic === 'All') {
          completed = await QuizService.getCompletedQuestions();
        } else if (selectedTopic === 'Bookmarked') {
          // For bookmarked, we need to get completed questions that are also bookmarked
          const allCompleted = await QuizService.getCompletedQuestions();
          const bookmarkedIds = await BookmarkService.getBookmarkedQuestionIds();
          completed = allCompleted.filter(id => bookmarkedIds.includes(id));
        } else {
          // Get topic ID and filter completed questions for this topic
          const topicData = await QuizService.getTopics();
          const topic = topicData.find(t => t.name === selectedTopic);
          if (topic) {
            completed = await QuizService.getCompletedQuestions(topic.id);
          }
        }
        
        setCompletedQuestions(new Set(completed));
        
        // Check if user has started for this topic
        setHasStarted(completed.length > 0);
        
      } catch (error) {
        console.error('Failed to load topic data:', error);
      }
    };
    
    if (!loading) {
      loadTopicData();
    }
  }, [selectedTopic, loading]);

  const filteredQuizData: QuizItem[] = React.useMemo(() => {
    if (selectedTopic === 'All') {
      return quizData;
    }
    if (selectedTopic === 'Bookmarked') {
      return quizData.filter(quiz => bookmarkedQuestions[quiz.id]);
    }
    return quizData.filter(quiz => quiz.topic === selectedTopic);
  }, [selectedTopic, bookmarkedQuestions, quizData]);

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

  const handleAnswer = async (questionId: number, selectedOption: string): Promise<void> => {
    try {
      if (!completedQuestions.has(questionId)) {
        setHasStarted(true);
        
        // Save to database
        await QuizService.saveQuizAnswer(questionId, selectedOption);
        
        // Update local state
        const newSelectedAnswers = {
          ...selectedAnswers,
          [questionId]: selectedOption
        };
        setSelectedAnswers(newSelectedAnswers);

        const newCompletedQuestions = new Set([...completedQuestions, questionId]);
        setCompletedQuestions(newCompletedQuestions);
      } else if (calculateCompletion() === 100) {
        // Allow editing answers when all questions are completed
        await QuizService.saveQuizAnswer(questionId, selectedOption);
        
        const newSelectedAnswers = {
          ...selectedAnswers,
          [questionId]: selectedOption
        };
        setSelectedAnswers(newSelectedAnswers);
      }
    } catch (error) {
      console.error('Failed to save quiz answer:', error);
    }
  };

  const toggleQuestion = (questionId: number): void => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const toggleBookmark = async (questionId: number): Promise<void> => {
    try {
      // Toggle in database
      const isNowBookmarked = await BookmarkService.toggleBookmark(questionId);
      
      // Update local state
      const updatedBookmarks = {
        ...bookmarkedQuestions,
        [questionId]: isNowBookmarked
      };
      setBookmarkedQuestions(updatedBookmarks);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading quiz data...</Text>
      </View>
    );
  }

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

        <View style={styles.progressMargin}>
          <ProgressBar progressFunc={calculateProgress} backgroundColor={"#e5e7eb"} />
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
                  {<Ionicons  // Use the imported Icon
                    name={bookmarkedQuestions[quiz.id] ? 'bookmark' : 'bookmark-outline'} // Example: MaterialIcons bookmark and bookmark-border
                    size={20} // Adjust the size as needed
                    color={bookmarkedQuestions[quiz.id] ? '#fbbf24' : '#9ca3af'} // Set the color
                  />}
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


      </View>
    </ScrollView>
  );
}

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  progressMargin: ViewStyle;
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
  progressMargin: {
    marginBottom: 24,
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