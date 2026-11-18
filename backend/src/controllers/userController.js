const User = require('../models/User');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/Warden)
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    
    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    // Filter by course (for students)
    if (req.query.course) {
      query.course = new RegExp(req.query.course, 'i');
    }
    
    // Filter by year (for students)
    if (req.query.year) {
      query.year = parseInt(req.query.year);
    }
    
    // Filter by block (for room assignments)
    if (req.query.block) {
      query.roomNumber = new RegExp(`^${req.query.block}`, 'i');
    }
    
    // Search by name or email
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { studentId: searchRegex }
      ];
    }

    // Execute query
    const users = await User.find(query)
      .select('-password -passwordResetToken -passwordResetExpires -faceDescriptors')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Pagination result
    const pagination = {};
    
    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination,
      data: users
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -passwordResetToken -passwordResetExpires -faceDescriptors')
      .populate('children', 'firstName lastName studentId roomNumber');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Check if student ID already exists (for students)
    if (req.body.studentId) {
      const existingStudent = await User.findOne({ studentId: req.body.studentId });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          error: 'Student ID already exists'
        });
      }
    }

    const user = await User.create(req.body);

    logger.info(`User created by ${req.user.email}: ${user.email}`);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin/Self)
const updateUser = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user can update this profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user'
      });
    }

    // Prevent non-admin users from changing sensitive fields
    if (req.user.role !== 'admin') {
      delete req.body.role;
      delete req.body.permissions;
      delete req.body.isActive;
      delete req.body.isEmailVerified;
      delete req.body.isPhoneVerified;
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }

    // Check if student ID is being changed and if it already exists
    if (req.body.studentId && req.body.studentId !== user.studentId) {
      const existingStudent = await User.findOne({ studentId: req.body.studentId });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          error: 'Student ID already exists'
        });
      }
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password -passwordResetToken -passwordResetExpires -faceDescriptors');

    logger.info(`User updated by ${req.user.email}: ${user.email}`);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent deletion of admin users by non-super-admin
    if (user.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete admin users'
      });
    }

    // Soft delete - deactivate instead of removing
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    logger.info(`User deleted by ${req.user.email}: ${user.email}`);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin/Warden)
const getUserStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          emailVerified: {
            $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
          }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        roleStats: stats
      }
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Bulk update users
// @route   PUT /api/users/bulk
// @access  Private (Admin)
const bulkUpdateUsers = async (req, res, next) => {
  try {
    const { userIds, updateData } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'User IDs array is required'
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateData,
      { runValidators: true }
    );

    logger.info(`Bulk update performed by ${req.user.email} on ${userIds.length} users`);

    res.status(200).json({
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    logger.error('Bulk update users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  bulkUpdateUsers
};
