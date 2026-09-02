import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizItem extends Document {
  id: number;
  topic: string;
  title: string;
  question: string;
  options: string[];
  correctAnswer: string;
  feedback: string;
}

export type QuizItemInput = Omit<IQuizItem, keyof Document>;

const quizItemSchema = new Schema<IQuizItem>(
  {
    id: { 
      type: Number, 
      required: true, 
      unique: true 
    },
    topic: { 
      type: String, 
      required: true,
      trim: true 
    },
    title: { 
      type: String, 
      required: true,
      trim: true 
    },
    question: { 
      type: String, 
      required: true 
    },
    options: { 
      type: [String], 
      required: true,
      validate: [(val: string[]) => val.length > 0, 'Quiz item must have at least one option'] 
    },
    correctAnswer: {
      type: String,
      required: true,
      validate: {
        validator: function(this: unknown, v: string) {
          return (this as IQuizItem).options.includes(v);
        },
        message: 'Correct answer must be one of the provided options'
      }
    },
    feedback: { 
      type: String, 
      required: true 
    }
  },
  { timestamps: true }
);

export const QuizItem = mongoose.model<IQuizItem>('QuizItem', quizItemSchema);