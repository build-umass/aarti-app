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
        validator: function(this: IQuizItem, v: string) {
          return this.options.includes(v);
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

quizItemSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastQuizItem = await QuizItem.findOne().sort({ id: -1 });
    this.id = lastQuizItem ? lastQuizItem.id + 1 : 1;
  }
  next();
});

export const QuizItem = mongoose.model<IQuizItem>('QuizItem', quizItemSchema);