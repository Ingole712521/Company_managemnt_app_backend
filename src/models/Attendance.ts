import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  totalHours?: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  notes?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
}

const attendanceSchema = new Schema<IAttendance>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in time is required']
  },
  checkOut: {
    type: Date
  },
  totalHours: {
    type: Number,
    min: 0
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half Day'],
    default: 'Present'
  }
}, {
  timestamps: true
});

// Compound index for unique user-date combination
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ userId: 1 });

// Calculate total hours when check-out is set
attendanceSchema.pre('save', function(next) {
  if (this.checkOut && this.checkIn) {
    const diffMs = this.checkOut.getTime() - this.checkIn.getTime();
    this.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

export default mongoose.model<IAttendance>('Attendance', attendanceSchema); 