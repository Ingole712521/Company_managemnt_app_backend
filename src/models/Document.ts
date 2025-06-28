import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  category: 'Personal' | 'Work' | 'HR' | 'Finance' | 'Legal' | 'Other';
  description?: string;
  tags?: string[];
  isPublic: boolean;
  sharedWith?: mongoose.Types.ObjectId[];
  uploadedAt: Date;
  lastAccessed?: Date;
  accessCount: number;
}

const documentSchema = new Schema<IDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required'],
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    trim: true
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: 0
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  category: {
    type: String,
    enum: ['Personal', 'Work', 'HR', 'Finance', 'Legal', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date
  },
  accessCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ fileType: 1 });
documentSchema.index({ uploadedAt: -1 });
documentSchema.index({ tags: 1 });

// Update access count and last accessed time
documentSchema.methods.incrementAccess = function() {
  this.accessCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

export default mongoose.model<IDocument>('Document', documentSchema); 