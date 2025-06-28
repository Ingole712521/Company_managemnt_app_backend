import mongoose, { Document, Schema } from 'mongoose';

export interface ILeave extends Document {
  userId: mongoose.Types.ObjectId;
  fromDate: Date;
  toDate: Date;
  reason: string;
  leaveType: 'Sick' | 'Casual' | 'Annual' | 'Maternity' | 'Paternity' | 'Unpaid';
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  attachments?: string[];
  totalDays: number;
  halfDay?: boolean;
  halfDayType?: 'Morning' | 'Afternoon';
}

const leaveSchema = new Schema<ILeave>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  fromDate: {
    type: Date,
    required: [true, 'From date is required']
  },
  toDate: {
    type: Date,
    required: [true, 'To date is required']
  },
  reason: {
    type: String,
    required: [true, 'Leave reason is required'],
    trim: true
  },
  leaveType: {
    type: String,
    enum: ['Sick', 'Casual', 'Annual', 'Maternity', 'Paternity', 'Unpaid'],
    required: [true, 'Leave type is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  attachments: [{
    type: String
  }],
  totalDays: {
    type: Number,
    required: true,
    min: 0.5
  },
  halfDay: {
    type: Boolean,
    default: false
  },
  halfDayType: {
    type: String,
    enum: ['Morning', 'Afternoon']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
leaveSchema.index({ userId: 1, status: 1 });
leaveSchema.index({ fromDate: 1, toDate: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ approvedBy: 1 });

// Calculate total days before saving
leaveSchema.pre('save', function(next) {
  if (this.fromDate && this.toDate) {
    const diffTime = Math.abs(this.toDate.getTime() - this.fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (this.halfDay) {
      this.totalDays = 0.5;
    } else {
      this.totalDays = diffDays;
    }
  }
  next();
});

// Validate that toDate is after fromDate
leaveSchema.pre('save', function(next) {
  if (this.toDate <= this.fromDate) {
    return next(new Error('To date must be after from date'));
  }
  next();
});

export default mongoose.model<ILeave>('Leave', leaveSchema); 