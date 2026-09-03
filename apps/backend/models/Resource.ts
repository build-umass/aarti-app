import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  id: number;
  topic: string;
  title: string;
  content: string;
  isPublished?: boolean;
}

export type ResourceInput = Pick<IResource, 'topic' | 'title'> & {
  content?: string;
  isPublished?: boolean;
};

const resourceSchema = new Schema<IResource>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Resource = mongoose.model<IResource>('Resource', resourceSchema);
