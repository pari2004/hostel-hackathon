const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
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
  
  // Leave Details
  leaveType: {
    type: String,
    enum: [
      'sick_leave',
      'casual_leave',
      'emergency_leave',
      'home_visit',
      'medical_leave',
      'academic_leave',
      'other'
    ],
    required: [true, 'Leave type is required']
  },
  
  // Dates
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  
  // Duration
  totalDays: {
    type: Number,
    required: true,
    min: [0.5, 'Minimum leave duration is 0.5 days']
  },
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayPeriod: {
    type: String,
    enum: ['morning', 'afternoon'],
    required: function() {
      return this.isHalfDay;
    }
  },
  
  // Reason and Documentation
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    maxlength: [1000, 'Reason cannot exceed 1000 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Supporting Documents
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Contact Information During Leave
  contactDuringLeave: {
    phone: {
      type: String,
      match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
    },
    email: {
      type: String,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  
  // Emergency Contact During Leave
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
    }
  },
  
  // Approval Workflow
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'expired'],
    default: 'pending'
  },
  
  // Approval Chain
  approvals: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approverRole: {
      type: String,
      enum: ['warden', 'admin', 'hod'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comments: {
      type: String,
      maxlength: [500, 'Comments cannot exceed 500 characters']
    },
    actionDate: {
      type: Date
    },
    order: {
      type: Number,
      required: true
    }
  }],
  
  // Final Approval Details
  finalApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: {
    type: Date
  },
  rejectedDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  
  // Leave Execution
  actualStartDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  actualDays: {
    type: Number
  },
  
  // Return Information
  returnDate: {
    type: Date
  },
  returnConfirmed: {
    type: Boolean,
    default: false
  },
  returnConfirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  returnConfirmedAt: {
    type: Date
  },
  
  // Extension Requests
  extensionRequests: [{
    requestedEndDate: {
      type: Date,
      required: true
    },
    additionalDays: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true,
      maxlength: [500, 'Extension reason cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    }
  }],
  
  // Notifications
  notificationsSent: [{
    type: {
      type: String,
      enum: ['application', 'approval', 'rejection', 'reminder', 'return']
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['email', 'sms', 'push']
    }
  }],
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
leaveSchema.index({ user: 1, startDate: 1 });
leaveSchema.index({ studentId: 1, status: 1 });
leaveSchema.index({ status: 1, startDate: 1 });
leaveSchema.index({ leaveType: 1 });
leaveSchema.index({ appliedDate: 1 });

// Virtual for leave duration in days
leaveSchema.virtual('durationInDays').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return this.isHalfDay ? 0.5 : diffDays;
  }
  return 0;
});

// Virtual for current approval status
leaveSchema.virtual('currentApprovalStep').get(function() {
  const pendingApproval = this.approvals.find(approval => approval.status === 'pending');
  return pendingApproval ? pendingApproval.order : null;
});

// Virtual for days until leave starts
leaveSchema.virtual('daysUntilStart').get(function() {
  if (this.startDate) {
    const today = new Date();
    const diffTime = this.startDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Pre-save middleware to calculate total days
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    this.totalDays = this.isHalfDay ? 0.5 : diffDays;
  }
  next();
});

// Static method to get leave statistics
leaveSchema.statics.getLeaveStatistics = async function(userId, year) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);
  
  const pipeline = [
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        startDate: {
          $gte: startOfYear,
          $lte: endOfYear
        },
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$leaveType',
        totalDays: { $sum: '$totalDays' },
        count: { $sum: 1 }
      }
    }
  ];
  
  return await this.aggregate(pipeline);
};

module.exports = mongoose.model('Leave', leaveSchema);
