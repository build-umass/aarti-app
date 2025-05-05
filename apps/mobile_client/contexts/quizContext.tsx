import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { MMKV } from 'react-native-mmkv';
import { QuizItem } from '../../../types';
import {
    ViewStyle,
} from "react-native"

interface SelectedAnswers {
    [key: number]: string;
}

interface BookmarkedQuestions {
    [key: number]: boolean;
}

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

// --- Constants and Storage Initialization ---
// WEB:
// const API_BASE_URL = 'http://localhost:3002'; 
// ANDROID: 
const API_BASE_URL = 'http://10.0.2.2:3002';

const bookmarkedQuestionsStorage = new MMKV({ id: 'bookmarkedQuestionsStorage' });
export const generalQuestionsStorage = new MMKV({ id: 'generalQuestionsStorage' });

const loadSelectedAnswers = (): SelectedAnswers => {
    const storedAnswers = generalQuestionsStorage.getString('selectedAnswers');
    try {
        return storedAnswers ? JSON.parse(storedAnswers) : {};
    } catch (e) {
        console.error("Failed to parse selected answers:", e);
        return {};
    }
};

const loadBookmarkedQuestions = (): BookmarkedQuestions => {
    const storedBookmarks = bookmarkedQuestionsStorage.getString('bookmarkedQuestions');
    try {
        return storedBookmarks ? JSON.parse(storedBookmarks) : {};
    } catch (e) {
        console.error("Failed to parse bookmarked questions:", e);
        return {};
    }
};

// Function to load completed questions based on the selected topic
const loadCompletedQuestions = (topic: string): Set<number> => {
    const storedProgress = generalQuestionsStorage.getString('completedQuestions');
    const storedTopicProgress = generalQuestionsStorage.getString(`completedQuestions_${topic}`);

    try {
        if (topic === 'All' || topic === 'Bookmarked') {
            // For 'All' or 'Bookmarked', load the general progress
            return storedProgress ? new Set(JSON.parse(storedProgress)) : new Set();
        }
        // For specific topics, load topic-specific progress
        return storedTopicProgress ? new Set(JSON.parse(storedTopicProgress)) : new Set();
    } catch (e) {
        console.error(`Failed to parse completed questions for topic ${topic}:`, e);
        return new Set();
    }
};

// --- Define the Context Shape ---
interface QuizContextType {
    quizData: QuizItem[] | null;
    isLoading: boolean;
    error: string | null;
    selectedTopic: string;
    setSelectedTopic: (topic: string) => void;
    filteredQuizData: QuizItem[];
    topics: string[];
    selectedAnswers: SelectedAnswers;
    completedQuestions: Set<number>;
    bookmarkedQuestions: BookmarkedQuestions;
    handleAnswer: (questionId: number, selectedOption: string) => void;
    toggleBookmark: (questionId: number) => void;
    calculateProgress: () => number;
    calculateCompletion: () => number;
    getCompletedCount: () => number;
    hasStarted: boolean;
}

const QuizContext = createContext<QuizContextType | null>(null);

interface QuizProviderProps {
    children: ReactNode;
}

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
    const [quizData, setQuizData] = useState<QuizItem[] | null>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>(() => loadSelectedAnswers());
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState<BookmarkedQuestions>(() => loadBookmarkedQuestions());
    const [selectedTopic, setSelectedTopicState] = useState<string>('All');
    const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(() => loadCompletedQuestions(selectedTopic));
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hasStarted, setHasStarted] = useState<boolean>(false);

    useEffect(() => {
        const fetchQuizzes = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/quiz`);
                if (!response.ok) throw new Error(`Failed to fetch quizzes: ${response.statusText}`);
                const data: QuizItem[] = await response.json();
                setQuizData(data);
            } catch (err) {
                console.error('Error fetching quizzes:', err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    useEffect(() => {
        setCompletedQuestions(loadCompletedQuestions(selectedTopic));
    }, [selectedTopic]);

    useEffect(() => {
        if (completedQuestions.size > 0) {
            setHasStarted(true);
        }
        // Maybe add: else { setHasStarted(false); } if needed
    }, [completedQuestions]);

    // --- Memoized Derived State ---
    const topics = useMemo<string[]>(() => {
        if (!quizData) return ['All', 'Bookmarked'];
        const uniqueTopics = new Set(quizData.map(quiz => quiz.topic));
        return ['All', 'Bookmarked', ...uniqueTopics];
    }, [quizData]);

    const filteredQuizData = useMemo<QuizItem[]>(() => {
        if (!quizData) return [];
        if (selectedTopic === 'All') return quizData;
        if (selectedTopic === 'Bookmarked') return quizData.filter(quiz => bookmarkedQuestions[quiz.id]);
        return quizData.filter(quiz => quiz.topic === selectedTopic);
    }, [quizData, selectedTopic, bookmarkedQuestions]);

    // --- Memoized Callback Functions (to prevent unnecessary re-renders of consumers) ---
    const setSelectedTopic = useCallback((topic: string) => {
        setSelectedTopicState(topic);
    }, []);

    const updateCompletedQuestionsStorage = (newCompletedQuestions: Set<number>, selectedTopic: string) => {
        try {
            // Store overall progress under a general key
            generalQuestionsStorage.set('completedQuestions', JSON.stringify([...newCompletedQuestions]));

            // Store topic-specific progress only if it's not 'All' or 'Bookmarked'
            if (selectedTopic !== 'All' && selectedTopic !== 'Bookmarked') {
                generalQuestionsStorage.set(
                    `completedQuestions_${selectedTopic}`,
                    JSON.stringify([...newCompletedQuestions])
                );
            }
        } catch (e) {
            console.error("Failed to save completed questions:", e);
        }
    };


    const handleAnswer = useCallback((questionId: number, selectedOption: string) => {
        const isCompleted = completedQuestions.has(questionId);
        // Calculate completion within the callback if needed, or pass from memoized value
        const currentCompletion = calculateCompletion(); // Assuming calculateCompletion is stable or memoized below
        const isQuizFullyCompleted = currentCompletion === 100;

        if (!isCompleted || isQuizFullyCompleted) {
            const newSelectedAnswers = { ...selectedAnswers, [questionId]: selectedOption };
            setSelectedAnswers(newSelectedAnswers);
            try {
                generalQuestionsStorage.set('selectedAnswers', JSON.stringify(newSelectedAnswers));
            } catch (e) { console.error("Failed to save selected answers:", e); }


            if (!isCompleted) {
                setHasStarted(true);
                const newCompletedQuestions = new Set(completedQuestions);
                newCompletedQuestions.add(questionId);
                setCompletedQuestions(newCompletedQuestions);
                updateCompletedQuestionsStorage(newCompletedQuestions, selectedTopic);
            }
        }
    }, [selectedAnswers, completedQuestions, selectedTopic]); // Add dependencies

    const toggleBookmark = useCallback((questionId: number) => {
        const updatedBookmarks = { ...bookmarkedQuestions, [questionId]: !bookmarkedQuestions[questionId] };
        setBookmarkedQuestions(updatedBookmarks);
        try {
            bookmarkedQuestionsStorage.set('bookmarkedQuestions', JSON.stringify(updatedBookmarks));
        } catch (e) { console.error("Failed to save bookmarks:", e); }
    }, [bookmarkedQuestions]);

    // --- Memoized Calculation Functions ---
    const calculateCompletion = useCallback(() => {
        if (!quizData || filteredQuizData.length === 0) return 0;
        const totalQuestions = filteredQuizData.length;
        const completedCount = filteredQuizData.filter(quiz => completedQuestions.has(quiz.id)).length;
        return Math.round((completedCount / totalQuestions) * 100);
    }, [quizData, filteredQuizData, completedQuestions]);

    const calculateProgress = useCallback(() => {
        if (!quizData || (!hasStarted && completedQuestions.size === 0) || filteredQuizData.length === 0) return 0;
        const totalQuestions = filteredQuizData.length;
        const correctAnswersCount = filteredQuizData.filter(quiz => selectedAnswers[quiz.id] === quiz.correctAnswer).length;
        return Math.round((correctAnswersCount / totalQuestions) * 100);
    }, [quizData, hasStarted, completedQuestions, filteredQuizData, selectedAnswers]);

    const getCompletedCount = useCallback(() => {
        if (!quizData || filteredQuizData.length === 0) return 0;
        return filteredQuizData.filter(quiz => completedQuestions.has(quiz.id)).length;
    }, [quizData, filteredQuizData, completedQuestions]);


    // --- Memoize the Context Value ---
    // This is crucial for performance. Only create a new value object when necessary data changes.
    const contextValue = useMemo(() => ({
        quizData,
        isLoading,
        error,
        selectedTopic,
        setSelectedTopic,
        filteredQuizData,
        topics,
        selectedAnswers,
        completedQuestions,
        bookmarkedQuestions,
        handleAnswer,
        toggleBookmark,
        calculateProgress,
        calculateCompletion,
        getCompletedCount,
        hasStarted,
    }), [
        quizData, isLoading, error, selectedTopic, setSelectedTopic, filteredQuizData, topics,
        selectedAnswers, completedQuestions, bookmarkedQuestions, handleAnswer, toggleBookmark,
        calculateProgress, calculateCompletion, getCompletedCount, hasStarted
    ]);

    return (
        <QuizContext.Provider value={contextValue}>
            {children}
        </QuizContext.Provider>
    );
};

// --- Create a Custom Hook for Easy Consumption ---
export const useQuiz = (): QuizContextType => {
    const context = useContext(QuizContext);
    if (context === null) {
        throw new Error('useQuiz must be used within a QuizProvider');
    }
    return context;
};