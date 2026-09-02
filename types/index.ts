export interface QuizItem {
    id: number;
    topic: string;
    title: string;
    question: string;
    options: string[];
    correctAnswer: string;
    feedback: string;
}

export interface Resource {
    id: number;
    topic: string;
    title: string;
    content: string;
    isPublished?: boolean;
}

export interface MockResource {
    id: string;
    title: string;
    sections: Section[];
}

export interface Section {
    header: string;
    content: string;
}