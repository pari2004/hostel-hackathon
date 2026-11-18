const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  summary: {
    type: String,
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  
  // Author Information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  authorRole: {
    type: String,
    enum: ['warden', 'admin', 'hod', 'management'],
    required: [true, 'Author role is required']
  },
  
  // Announcement Type and Priority
  type: {
    type: String,
    enum: [
      'general',
      'urgent',
      'maintenance',
      'academic',
      'event',
      'policy',
      'emergency',
      'celebration',
      'reminder'
    ],
    required: [true, 'Announcement type is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Target Audience
  targetAudience: {
    roles: [{
      type: String,
      enum: ['student', 'warden', 'admin', 'parent', 'all'],
      default: 'all'
    }],
    courses: [String],
    years: [Number],
    blocks: [String],
    rooms: [String],
    specificUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Scheduling
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  scheduledFor: {
    type: Date
  },
  
  // Status and Visibility
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'expired'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  
  // Media Attachments
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
  
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Interaction Tracking
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],
  
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'love', 'helpful', 'important', 'concern'],
      required: true
    },
    reactedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    commentedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notification Tracking
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'in_app']
    },
    recipients: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent'
      },
      sentAt: {
        type: Date,
        default: Date.now
      },
      readAt: Date
    }],
    totalSent: {
      type: Number,
      default: 0
    },
    totalDelivered: {
      type: Number,
      default: 0
    },
    totalRead: {
      type: Number,
      default: 0
    }
  }],
  
  // Analytics
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    totalReactions: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    },
    engagementRate: {
      type: Number,
      default: 0
    }
  },
  
  // Related Content
  relatedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  relatedAnnouncements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement'
  }],
  
  // Tags and Categories
  tags: [String],
  category: {
    type: String,
    trim: true
  },
  
  // Approval Workflow (for sensitive announcements)
  requiresApproval: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
announcementSchema.index({ publishDate: -1, status: 1 });
announcementSchema.index({ author: 1, status: 1 });
announcementSchema.index({ type: 1, priority: 1 });
announcementSchema.index({ isPinned: 1, publishDate: -1 });
announcementSchema.index({ tags: 1 });
announcementSchema.index({ expiryDate: 1 });

// Virtual for view count
announcementSchema.virtual('viewCount').get(function() {
  return this.views ? this.views.length : 0;
});

// Virtual for reaction count
announcementSchema.virtual('reactionCount').get(function() {
  return this.reactions ? this.reactions.length : 0;
});

// Virtual for comment count
announcementSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.filter(comment => comment.isApproved).length : 0;
});

// Virtual for is expired
announcementSchema.virtual('isExpired').get(function() {
  return this.expiryDate && new Date() > this.expiryDate;
});

// Pre-save middleware to update analytics
announcementSchema.pre('save', function(next) {
  // Update analytics
  this.analytics.totalViews = this.views ? this.views.length : 0;
  this.analytics.uniqueViews = this.views ? 
    new Set(this.views.map(view => view.user.toString())).size : 0;
  this.analytics.totalReactions = this.reactions ? this.reactions.length : 0;
  this.analytics.totalComments = this.comments ? 
    this.comments.filter(comment => comment.isApproved).length : 0;
  
  // Calculate engagement rate
  if (this.analytics.uniqueViews > 0) {
    const engagements = this.analytics.totalReactions + this.analytics.totalComments;
    this.analytics.engagementRate = (engagements / this.analytics.uniqueViews) * 100;
  }
  
  // Auto-expire if past expiry date
  if (this.isExpired && this.status === 'published') {
    this.status = 'expired';
  }
  
  next();
});

// Static method to get active announcements
announcementSchema.statics.getActiveAnnouncements = async function(userRole, limit = 20) {
  const now = new Date();
  
  const query = {
    status: 'published',
    isActive: true,
    publishDate: { $lte: now },
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gte: now } }
    ]
  };
  
  // Filter by target audience if user role is provided
  if (userRole) {
    query.$or = [
      { 'targetAudience.roles': { $in: [userRole, 'all'] } },
      { 'targetAudience.roles': { $size: 0 } }
    ];
  }
  
  return await this.find(query)
    .sort({ isPinned: -1, priority: -1, publishDate: -1 })
    .limit(limit)
    .populate('author', 'firstName lastName role');
};

// Static method to get announcement statistics
announcementSchema.statics.getStatistics = async function(authorId, startDate, endDate) {
  const matchQuery = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (authorId) {
    matchQuery.author = new mongoose.Types.ObjectId(authorId);
  }
  
  const pipeline = [
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalAnnouncements: { $sum: 1 },
        publishedAnnouncements: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        totalViews: { $sum: '$analytics.totalViews' },
        totalReactions: { $sum: '$analytics.totalReactions' },
        totalComments: { $sum: '$analytics.totalComments' },
        averageEngagement: { $avg: '$analytics.engagementRate' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalAnnouncements: 0,
    publishedAnnouncements: 0,
    totalViews: 0,
    totalReactions: 0,
    totalComments: 0,
    averageEngagement: 0
  };
};

module.exports = mongoose.model('Announcement', announcementSchema);
