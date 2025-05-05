import React, { useState } from 'react'; // Removed useEffect, useMemo, MMKV
import {
  StyleSheet,
  ViewStyle,
  TextStyle,
  Text,
  View,
  Pressable,
  ScrollView,
  PressableStateCallbackType,
  ActivityIndicator
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { QuizItem } from '../../../../types'; // Keep type import
import ProgressBar from '@/components/ProgressBar'; // Keep component import
import { useQuiz } from '../../contexts/quizContext'; // Import the context hook

// --- Styles Interface (copied from original, no changes needed) ---
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
interface Styles {
  container: ViewStyle;
  centerContent: ViewStyle;
  loadingText: TextStyle;
  errorText: TextStyle;
  noQuestionsText: TextStyle;
  content: ViewStyle;
  progressMargin: ViewStyle;
  questionContainer: ViewStyle;
  questionHeader: ViewStyleWithShadow;
  questionTitle: TextStyle & { fontWeight: '500' };
  iconContainer: ViewStyle;
  expandIcon: ViewStyle;
  icon: TextStyle;
  questionContent: ViewStyleWithShadow;
  questionText: TextStyle;
  optionsContainer: ViewStyleWithGap;
  optionButton: ViewStyle;
  optionButtonPressed: ViewStyle;
  correctOption: ViewStyle;
  incorrectOption: ViewStyle;
  optionText: TextStyle;
  correctIcon: TextStyle;
  incorrectIcon: TextStyle;
  feedbackContainer: ViewStyleWithBorder;
  feedbackText: TextStyle;
  topicSelectorContainer: ViewStyle;
  topicLabel: TextStyle;
  topicScroll: ViewStyle;
  topicScrollContent: ViewStyle;
  topicButton: ViewStyle;
  selectedTopicButton: ViewStyle;
  topicButtonText: TextStyle & { fontWeight: '500' };
  selectedTopicButtonText: TextStyle;
  completionContainer: ViewStyleWithShadow;
  completionText: TextStyle & { fontWeight: '500' };
  completionNote: TextStyle;
  disabledOption: ViewStyle;
  bookmarkButton: ViewStyle;
}

// --- Component ---
export default function QuizPage() {
  // --- Consume Context ---
  // All quiz-related state and logic now comes from the context
  const {
    quizData, // Still needed for the null check initially
    isLoading,
    error,
    selectedTopic,
    setSelectedTopic,
    filteredQuizData,
    topics,
    selectedAnswers,
    completedQuestions,
    bookmarkedQuestions,
    handleAnswer, // Use context's handleAnswer
    toggleBookmark, // Use context's toggleBookmark
    calculateProgress, // Use context's calculation
    calculateCompletion, // Use context's calculation
    getCompletedCount, // Use context's calculation
    // hasStarted // Not directly used in rendering logic, but available if needed
  } = useQuiz();

  // --- Local UI State ---
  // State for managing which question is expanded remains local to this component
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // --- Local UI Functions ---
  // Function to toggle question expansion remains local
  const toggleQuestion = (questionId: number): void => {
    setExpandedQuestion(prevExpanded => (prevExpanded === questionId ? null : questionId));
  };

  // --- Removed State Definitions ---
  // [quizData, setQuizData] -> Provided by context
  // [selectedAnswers, setSelectedAnswers] -> Provided by context
  // [bookmarkedQuestions, setBookmarkedQuestions] -> Provided by context
  // [selectedTopic, setSelectedTopic] -> Provided by context
  // [completedQuestions, setCompletedQuestions] -> Provided by context
  // [hasStarted, setHasStarted] -> Provided by context
  // [isLoading, setIsLoading] -> Provided by context
  // [error, setError] -> Provided by context

  // --- Removed Effects ---
  // useEffect for fetching data -> Handled by context
  // useEffect for updating completedQuestions on topic change -> Handled by context
  // useEffect for setting hasStarted -> Handled by context

  // --- Removed Derived State Calculations ---
  // topics useMemo -> Provided by context
  // filteredQuizData useMemo -> Provided by context
  // calculateProgress function -> Provided by context
  // calculateCompletion function -> Provided by context
  // getCompletedCount function -> Provided by context

  // --- Removed Handler Functions ---
  // handleAnswer -> Provided by context
  // toggleBookmark -> Provided by context
  // (Storage functions like load/update are internal to context)

  // --- Conditional Rendering for Loading/Error States ---
  // Uses isLoading and error directly from the context
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Quiz...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error loading quiz: {error}</Text>
        {/* Optionally add a retry button here */}
      </View>
    );
  }

  // Ensure quizData is loaded before proceeding (context might still be loading initially)
  // Although isLoading=false should guarantee quizData is at least [], this is an extra safety check
  if (!quizData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        {/* Could show a different message or rely on isLoading */}
        <Text style={styles.errorText}>No quiz data available yet.</Text>
      </View>
    );
  }

  // --- Render JSX (using context values) ---
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Topic Selector */}
        <View style={styles.topicSelectorContainer}>
          <Text style={styles.topicLabel}>Select Topic:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topicScrollContent}
            style={styles.topicScroll}
          >
            {/* Use topics from context */}
            {topics.map((topic: string) => (
              <Pressable
                key={topic}
                style={[
                  styles.topicButton,
                  selectedTopic === topic && styles.selectedTopicButton // Use selectedTopic from context
                ]}
                onPress={() => setSelectedTopic(topic)} // Use setSelectedTopic from context
              >
                <Text style={[
                  styles.topicButtonText,
                  selectedTopic === topic && styles.selectedTopicButtonText // Use selectedTopic from context
                ]}>
                  {topic}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressMargin}>
          {/* Pass calculateProgress function from context */}
          <ProgressBar progressFunc={calculateProgress} backgroundColor={"#e5e7eb"} />
        </View>

        {/* Completion Status */}
        <View style={styles.completionContainer}>
          <Text style={styles.completionText}>
            {/* Use getCompletedCount from context and filteredQuizData from context */}
            Questions completed: {getCompletedCount()}/{filteredQuizData.length}
          </Text>
          {/* Use calculateCompletion from context */}
          {calculateCompletion() === 100 && filteredQuizData.length > 0 && (
            <Text style={styles.completionNote}>
              You can now review and change your answers.
            </Text>
          )}
        </View>

        {/* Quiz Questions List */}
        {/* Use filteredQuizData from context */}
        {filteredQuizData.length === 0 ? (
          <Text style={styles.noQuestionsText}>No questions found for "{selectedTopic}".</Text> // Use selectedTopic from context
        ) : (
          /* Use filteredQuizData from context */
          filteredQuizData.map((quiz: QuizItem) => {
            const isCompleted = completedQuestions.has(quiz.id); // Use completedQuestions from context
            const currentCompletion = calculateCompletion(); // Use calculateCompletion from context
            const canInteract = !isCompleted || currentCompletion === 100;

            return (
              <View key={quiz.id} style={styles.questionContainer}>
                {/* Question Header (Pressable to expand/collapse) */}
                <Pressable
                  onPress={() => toggleQuestion(quiz.id)} // Uses local toggleQuestion
                  style={styles.questionHeader}
                >
                  <Text style={styles.questionTitle}>{quiz.title}</Text>
                  <View style={styles.iconContainer}>
                    {/* Bookmark Button */}
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleBookmark(quiz.id); // Use toggleBookmark from context
                      }}
                      hitSlop={8}
                      style={styles.bookmarkButton}
                    >
                      <Ionicons
                        name={bookmarkedQuestions[quiz.id] ? 'bookmark' : 'bookmark-outline'} // Use bookmarkedQuestions from context
                        size={20}
                        color={bookmarkedQuestions[quiz.id] ? '#fbbf24' : '#9ca3af'} // Use bookmarkedQuestions from context
                      />
                    </Pressable>
                    {/* Expand/collapse icon based on local state */}
                    <Ionicons
                      name={expandedQuestion === quiz.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color='#9ca3af'
                    />
                  </View>
                </Pressable>

                {/* Expanded Question Content (uses local expandedQuestion state) */}
                {expandedQuestion === quiz.id && (
                  <View style={styles.questionContent}>
                    <Text style={styles.questionText}>{quiz.question}</Text>
                    <View style={styles.optionsContainer}>
                      {quiz.options.map((option: string, index: number) => {
                        const isSelected = selectedAnswers[quiz.id] === option; // Use selectedAnswers from context
                        const isCorrect = option === quiz.correctAnswer;
                        // Determine button styles based on state
                        const getOptionStyle = ({ pressed }: PressableStateCallbackType): ViewStyle[] => {
                          const baseStyle = styles.optionButton;
                          let dynamicStyle: ViewStyle | undefined;

                          // Use selectedAnswers from context
                          if (selectedAnswers[quiz.id]) {
                            if (isSelected && !isCorrect) dynamicStyle = styles.incorrectOption;
                            else if (isCorrect) dynamicStyle = styles.correctOption;
                          }

                          const disabledStyle = !canInteract ? styles.disabledOption : undefined;
                          const pressedStyle = pressed ? styles.optionButtonPressed : undefined;

                          return [
                            baseStyle,
                            dynamicStyle,
                            disabledStyle,
                            pressedStyle
                          ].filter((style): style is ViewStyle => style !== undefined);
                        };

                        return (
                          <Pressable
                            key={index}
                            style={getOptionStyle}
                            onPress={() => handleAnswer(quiz.id, option)} // Use handleAnswer from context
                            disabled={!canInteract}
                          >
                            <Text style={styles.optionText}>{option}</Text>
                            {/* Use selectedAnswers from context */}
                            {selectedAnswers[quiz.id] && (
                              <>
                                {isCorrect && (
                                  <Ionicons name="checkmark-circle" size={20} style={[styles.icon, styles.correctIcon]} />
                                )}
                                {isSelected && !isCorrect && (
                                  <Ionicons name="close-circle" size={20} style={[styles.icon, styles.incorrectIcon]} />
                                )}
                              </>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>

                    {/* Feedback (shown only if an answer is selected) */}
                    {/* Use selectedAnswers from context */}
                    {selectedAnswers[quiz.id] && (
                      <View style={styles.feedbackContainer}>
                        <Text style={styles.feedbackText}>{quiz.feedback}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

// --- Styles ---
// Keep the existing styles object as it was
const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    flex: 1, // Ensure it takes full height for centering
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
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
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    flex: 1,
    marginRight: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIcon: {
    marginLeft: 8, // Keep spacing between bookmark and expand icon
  },
  icon: {
    // General icon styles
  },
  questionContent: {
    marginTop: 1,
    backgroundColor: '#fdfdff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  questionText: {
    color: '#1f2937',
    marginBottom: 16,
    fontSize: 15,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionButtonPressed: {
    backgroundColor: '#f3f4f6',
  },
  correctOption: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  incorrectOption: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  optionText: {
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  correctIcon: {
    color: '#16a34a',
  },
  incorrectIcon: {
    color: '#dc2626',
  },
  feedbackContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#60a5fa',
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
    marginBottom: 10,
    color: '#374151',
  },
  topicScroll: {
    flexGrow: 0,
  },
  topicScrollContent: {
    paddingRight: 8,
  },
  topicButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 10,
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
    padding: 16,
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
    textAlign: 'center',
  },
  completionNote: {
    marginTop: 6,
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  disabledOption: {
    opacity: 0.6,
    backgroundColor: '#f3f4f6',
  },
  bookmarkButton: {
    padding: 4,
  },
});