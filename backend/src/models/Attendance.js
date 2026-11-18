const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required']
  },
  
  // Date and Time
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  checkInTime: {
    type: Date,
    required: [true, 'Check-in time is required']
  },
  checkOutTime: {
    type: Date
  },
  
  // Attendance Method
  checkInMethod: {
    type: String,
    enum: ['facial_recognition', 'qr_code', 'nfc', 'manual'],
    required: [true, 'Check-in method is required']
  },
  checkOutMethod: {
    type: String,
    enum: ['facial_recognition', 'qr_code', 'nfc', 'manual']
  },
  
  // Location Information
  checkInLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    address: String
  },
  checkOutLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    address: String
  },
  
  // Device Information
  deviceInfo: {
    deviceId: String,
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'kiosk', 'camera']
    },
    ipAddress: String,
    userAgent: String
  },
  
  // Facial Recognition Data
  faceRecognition: {
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    faceImageUrl: String,
    processingTime: Number, // in milliseconds
    modelVersion: String
  },
  
  // QR/NFC Data
  scanData: {
    qrCode: String,
    nfcId: String,
    scanTime: Date
  },
  
  // Status and Validation
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'early_departure', 'on_leave'],
    default: 'present'
  },
  isValidated: {
    type: Boolean,
    default: false
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: {
    type: Date
  },
  
  // Duration Calculations
  duration: {
    type: Number, // in minutes
    default: 0
  },
  
  // Notes and Comments
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  
  // Flags
  isManualEntry: {
    type: Boolean,
    default: false
  },
  isLateEntry: {
    type: Boolean,
    default: false
  },
  isEarlyDeparture: {
    type: Boolean,
    default: false
  },
  
  // Related Leave
  relatedLeave: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Leave'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });
attendanceSchema.index({ studentId: 1, date: 1 });
attendanceSchema.index({ date: 1, status: 1 });
attendanceSchema.index({ checkInTime: 1 });
attendanceSchema.index({ 'checkInLocation.coordinates': '2dsphere' });

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Virtual for total hours
attendanceSchema.virtual('totalHours').get(function() {
  if (this.checkInTime && this.checkOutTime) {
    const diffMs = this.checkOutTime - this.checkInTime;
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }
  return 0;
});

// Virtual for late status
attendanceSchema.virtual('isLate').get(function() {
  if (!this.checkInTime) return false;
  
  const checkInHour = this.checkInTime.getHours();
  const checkInMinute = this.checkInTime.getMinutes();
  const lateThreshold = 9 * 60 + 30; // 9:30 AM in minutes
  const checkInMinutes = checkInHour * 60 + checkInMinute;
  
  return checkInMinutes > lateThreshold;
});

// Pre-save middleware to calculate duration and set flags
attendanceSchema.pre('save', function(next) {
  // Calculate duration if both check-in and check-out times are available
  if (this.checkInTime && this.checkOutTime) {
    const diffMs = this.checkOutTime - this.checkInTime;
    this.duration = Math.round(diffMs / (1000 * 60)); // in minutes
  }
  
  // Set late entry flag
  if (this.checkInTime) {
    const checkInHour = this.checkInTime.getHours();
    const checkInMinute = this.checkInTime.getMinutes();
    const lateThreshold = 9 * 60 + 30; // 9:30 AM in minutes
    const checkInMinutes = checkInHour * 60 + checkInMinute;
    
    this.isLateEntry = checkInMinutes > lateThreshold;
    
    if (this.isLateEntry) {
      this.status = 'late';
    }
  }
  
  // Set early departure flag
  if (this.checkOutTime) {
    const checkOutHour = this.checkOutTime.getHours();
    const checkOutMinute = this.checkOutTime.getMinutes();
    const earlyThreshold = 17 * 60; // 5:00 PM in minutes
    const checkOutMinutes = checkOutHour * 60 + checkOutMinute;
    
    this.isEarlyDeparture = checkOutMinutes < earlyThreshold;
    
    if (this.isEarlyDeparture && this.status === 'present') {
      this.status = 'early_departure';
    }
  }
  
  next();
});

// Static method to get attendance summary for a user
attendanceSchema.statics.getAttendanceSummary = async function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        presentDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
          }
        },
        lateDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'late'] }, 1, 0]
          }
        },
        absentDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
          }
        },
        leaveDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'on_leave'] }, 1, 0]
          }
        },
        totalHours: { $sum: '$duration' },
        averageCheckInTime: { $avg: '$checkInTime' },
        averageCheckOutTime: { $avg: '$checkOutTime' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalDays: 0,
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    leaveDays: 0,
    totalHours: 0
  };
};

// Static method to get daily attendance report
attendanceSchema.statics.getDailyReport = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await this.find({
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).populate('user', 'firstName lastName studentId roomNumber');
};

module.exports = mongoose.model('Attendance', attendanceSchema);
