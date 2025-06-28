import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'CEO' | 'HR' | 'Senior' | 'Junior';
  seniorId?: mongoose.Types.ObjectId;
  expoPushToken?: string;
  avatar?: string;
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  hireDate: Date;
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['CEO', 'HR', 'Senior', 'Junior'],
    default: 'Junior',
    required: true
  },
  seniorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.role === 'Junior';
    }
  },
  expoPushToken: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for juniors under this senior
userSchema.virtual('juniors', {
  ref: 'User',
  localField: '_id',
  foreignField: 'seniorId'
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ seniorId: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.ensureAdminUser = async function() {
  const admin = await this.findOne({ email: 'nehal@admin.com' });
  if (!admin) {
    const adminUser = new this({
      name: 'Admin',
      email: 'nehal@admin.com',
      password: 'nehal',
      role: 'CEO',
      isActive: true,
      hireDate: new Date()
    });
    await adminUser.save();
    console.log('Admin user created: nehal@admin.com / nehal');
  } else {
    console.log('Admin user already exists.');
  }
};

export default mongoose.model<IUser>('User', userSchema); 