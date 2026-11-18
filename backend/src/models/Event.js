const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Basic Event Information
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  
  // Event Type and Category
  eventType: {
    type: String,
    enum: [
      'cultural',
      'sports',
      'academic',
      'social',
      'workshop',
      'seminar',
      'competition',
      'meeting',
      'celebration',
      'other'
    ],
    required: [true, 'Event type is required']
  },
  category: {
    type: String,
    enum: ['mandatory', 'optional', 'invitation_only'],
    default: 'optional'
  },
  
  // Date and Time
  startDateTime: {
    type: Date,
    required: [true, 'Start date and time is required']
  },
  endDateTime: {
    type: Date,
    required: [true, 'End date and time is required']
  },
  registrationDeadline: {
    type: Date
  },
  
  // Location
  venue: {
    name: {
      type: String,
      required: [true, 'Venue name is required'],
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },
    capacity: {
      type: Number,
      min: [1, 'Venue capacity must be at least 1']
    },
    facilities: [String]
  },
  
  // Organizer Information
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required']
  },
  coOrganizers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  organizingCommittee: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      trim: true
    }
  }],
  
  // Registration and Participation
  requiresRegistration: {
    type: Boolean,
    default: true
  },
  maxParticipants: {
    type: Number,
    min: [1, 'Maximum participants must be at least 1']
  },
  minParticipants: {
    type: Number,
    min: [1, 'Minimum participants must be at least 1']
  },
  registrationFee: {
    amount: {
      type: Number,
      min: [0, 'Registration fee cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  // Eligibility Criteria
  eligibility: {
    roles: [{
      type: String,
      enum: ['student', 'warden', 'admin', 'parent']
    }],
    courses: [String],
    years: [Number],
    blocks: [String],
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'all'],
      default: 'all'
    }
  },
  
  // Event Status
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled', 'postponed'],
    default: 'draft'
  },
  
  // Registration Management
  registrations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'attended', 'cancelled', 'no_show'],
      default: 'registered'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'waived'],
      default: 'pending'
    },
    paymentId: String,
    notes: String,
    checkInTime: Date,
    checkOutTime: Date
  }],
  
  // Event Media
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    filename: String,
    originalName: String,
    url: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Event Schedule
  schedule: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    speaker: String,
    location: String
  }],
  
  // Requirements and Instructions
  requirements: [String],
  instructions: [String],
  whatToBring: [String],
  
  // Contact Information
  contactInfo: {
    email: {
      type: String,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
    },
    website: String
  },
  
  // Feedback and Reviews
  feedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [1000, 'Feedback comment cannot exceed 1000 characters']
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Event Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    registrations: {
      type: Number,
      default: 0
    },
    attendance: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    }
  },
  
  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['registration_open', 'registration_reminder', 'event_reminder', 'event_update', 'event_cancelled']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    recipients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
eventSchema.index({ startDateTime: 1, status: 1 });
eventSchema.index({ eventType: 1, status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ 'venue.coordinates.coordinates': '2dsphere' });
eventSchema.index({ tags: 1 });

// Virtual for event duration
eventSchema.virtual('duration').get(function() {
  if (this.startDateTime && this.endDateTime) {
    const diffMs = this.endDateTime - this.startDateTime;
    return Math.round(diffMs / (1000 * 60 * 60 * 100)) / 100; // in hours
  }
  return 0;
});

// Virtual for registration count
eventSchema.virtual('registrationCount').get(function() {
  return this.registrations ? this.registrations.length : 0;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  if (this.maxParticipants) {
    return this.maxParticipants - this.registrationCount;
  }
  return null;
});

// Virtual for is registration open
eventSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  const deadlinePassed = this.registrationDeadline && now > this.registrationDeadline;
  const eventStarted = now > this.startDateTime;
  const isFull = this.maxParticipants && this.registrationCount >= this.maxParticipants;
  
  return this.requiresRegistration && 
         this.status === 'published' && 
         !deadlinePassed && 
         !eventStarted && 
         !isFull;
});

// Pre-save middleware to update analytics
eventSchema.pre('save', function(next) {
  if (this.registrations) {
    this.analytics.registrations = this.registrations.length;
    this.analytics.attendance = this.registrations.filter(reg => reg.status === 'attended').length;
  }
  
  if (this.feedback && this.feedback.length > 0) {
    const totalRating = this.feedback.reduce((sum, fb) => sum + fb.rating, 0);
    this.analytics.averageRating = totalRating / this.feedback.length;
  }
  
  next();
});

// Static method to get upcoming events
eventSchema.statics.getUpcomingEvents = async function(limit = 10) {
  const now = new Date();
  return await this.find({
    startDateTime: { $gte: now },
    status: 'published',
    isActive: true
  })
  .sort({ startDateTime: 1 })
  .limit(limit)
  .populate('organizer', 'firstName lastName');
};

module.exports = mongoose.model('Event', eventSchema);
