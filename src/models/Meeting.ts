import mongoose, { Document, Schema } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  date: Date;
  startTime: Date;
  endTime: Date;
  meetLink?: string;
  googleCalendarEventId?: string;
  location?: string;
  meetingType: 'In-Person' | 'Virtual' | 'Hybrid';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  agenda?: string;
  attachments?: string[];
  reminders?: Array<{
    userId: mongoose.Types.ObjectId;
    sent: boolean;
    sentAt?: Date;
  }>;
}

const meetingSchema = new Schema<IMeeting>({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Meeting description is required'],
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Meeting creator is required']
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  date: {
    type: Date,
    required: [true, 'Meeting date is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  meetLink: {
    type: String,
    trim: true
  },
  googleCalendarEventId: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  meetingType: {
    type: String,
    enum: ['In-Person', 'Virtual', 'Hybrid'],
    default: 'Virtual'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  agenda: {
    type: String,
    trim: true
  },
  attachments: [{
    type: String
  }],
  reminders: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
meetingSchema.index({ participants: 1, date: 1 });
meetingSchema.index({ createdBy: 1 });
meetingSchema.index({ date: 1, startTime: 1 });
meetingSchema.index({ status: 1 });

// Validate that end time is after start time
meetingSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    return next(new Error('End time must be after start time'));
  }
  next();
});

export default mongoose.model<IMeeting>('Meeting', meetingSchema); 