import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  details: string;
  module: 'Auth' | 'Attendance' | 'Tasks' | 'Meetings' | 'Chat' | 'Leave' | 'Documents' | 'Announcements' | 'Profile';
  ipAddress?: string;
  userAgent?: string;
  status: 'Success' | 'Failed' | 'Warning';
  metadata?: Record<string, any>;
}

const activityLogSchema = new Schema<IActivityLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true
  },
  details: {
    type: String,
    required: [true, 'Details are required'],
    trim: true
  },
  module: {
    type: String,
    enum: ['Auth', 'Attendance', 'Tasks', 'Meetings', 'Chat', 'Leave', 'Documents', 'Announcements', 'Profile'],
    required: [true, 'Module is required']
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Success', 'Failed', 'Warning'],
    default: 'Success'
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ module: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ status: 1 });

// TTL index to automatically delete old logs (keep for 1 year)
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema); 