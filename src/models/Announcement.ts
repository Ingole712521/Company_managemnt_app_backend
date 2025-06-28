import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  targetRoles: string[];
  createdBy: mongoose.Types.ObjectId;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  isActive: boolean;
  attachments?: string[];
  readBy?: Array<{
    userId: mongoose.Types.ObjectId;
    readAt: Date;
  }>;
  expiresAt?: Date;
  category: 'General' | 'HR' | 'IT' | 'Finance' | 'Operations' | 'Events';
}

const announcementSchema = new Schema<IAnnouncement>({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    trim: true
  },
  targetRoles: [{
    type: String,
    enum: ['CEO', 'HR', 'Senior', 'Junior', 'All'],
    required: [true, 'Target roles are required']
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attachments: [{
    type: String
  }],
  readBy: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date
  },
  category: {
    type: String,
    enum: ['General', 'HR', 'IT', 'Finance', 'Operations', 'Events'],
    default: 'General'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
announcementSchema.index({ targetRoles: 1, isActive: 1 });
announcementSchema.index({ createdBy: 1 });
announcementSchema.index({ priority: 1 });
announcementSchema.index({ category: 1 });
announcementSchema.index({ createdAt: -1 });

// Virtual for read count
announcementSchema.virtual('readCount').get(function() {
  return this.readBy ? this.readBy.length : 0;
});

// Check if announcement is expired
announcementSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Mark as read by user
announcementSchema.methods.markAsRead = function(userId: mongoose.Types.ObjectId) {
  if (!this.readBy) {
    this.readBy = [];
  }
  
  const alreadyRead = this.readBy.some(reader => reader.userId.equals(userId));
  if (!alreadyRead) {
    this.readBy.push({
      userId,
      readAt: new Date()
    });
  }
  
  return this.save();
};

export default mongoose.model<IAnnouncement>('Announcement', announcementSchema); 