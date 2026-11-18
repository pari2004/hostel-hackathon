const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');
const { demoData, isDemoMode } = require('../utils/demoData');

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  let token;
  if (isDemoMode()) {
    token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  } else {
    token = user.getSignedJwtToken();
  }

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          roomNumber: user.roomNumber,
          permissions: user.permissions,
          isEmailVerified: user.isEmailVerified,
          avatar: user.avatar
        }
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
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

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      studentId,
      roomNumber,
      course,
      year,
      batch,
      dateOfBirth,
      gender,
      emergencyContact
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Check if student ID already exists (for students)
    if (studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          error: 'Student ID already exists'
        });
      }
    }

    // Set default permissions based on role
    let permissions = [];
    switch (role) {
      case 'student':
        permissions = ['view_attendance', 'view_leaves', 'view_events', 'view_announcements'];
        break;
      case 'parent':
        permissions = ['view_attendance', 'view_leaves'];
        break;
      case 'warden':
        permissions = [
          'view_attendance', 'manage_attendance', 'view_leaves', 'manage_leaves',
          'view_events', 'manage_events', 'view_announcements', 'manage_announcements'
        ];
        break;
      case 'admin':
        permissions = [
          'view_attendance', 'manage_attendance', 'view_leaves', 'manage_leaves',
          'view_events', 'manage_events', 'view_announcements', 'manage_announcements',
          'manage_users', 'view_analytics'
        ];
        break;
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      studentId,
      roomNumber,
      course,
      year,
      batch,
      dateOfBirth,
      gender,
      emergencyContact,
      permissions
    });

    logger.info(`New user registered: ${email} with role: ${role}`);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
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

    const { email, password } = req.body;

    // Check for user (demo mode or database)
    let user;
    if (isDemoMode()) {
      user = demoData.users.findOne({ email });
    } else {
      user = await User.findOne({ email }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        error: 'Account is temporarily locked due to failed login attempts'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Check if password matches
    let isMatch;
    if (isDemoMode()) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = await user.matchPassword(password);
    }

    if (!isMatch) {
      if (!isDemoMode()) {
        // Increment failed login attempts
        await user.incLoginAttempts();
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    if (!isDemoMode()) {
      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    logger.info(`User logged in: ${email}`);

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    logger.info(`User logged out: ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          studentId: user.studentId,
          roomNumber: user.roomNumber,
          course: user.course,
          year: user.year,
          batch: user.batch,
          permissions: user.permissions,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          avatar: user.avatar,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      emergencyContact: req.body.emergencyContact
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    logger.info(`User details updated: ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Update details error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during update'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    logger.info(`Password updated for user: ${req.user.email}`);

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('Update password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during password update'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'There is no user with that email'
      });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    // TODO: Send email with reset URL
    // For now, just return the token (in production, this should be sent via email)
    
    logger.info(`Password reset requested for user: ${req.body.email}`);

    res.status(200).json({
      success: true,
      data: 'Password reset email sent',
      // Remove this in production
      resetToken: resetToken
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    
    if (user) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.status(500).json({
      success: false,
      error: 'Email could not be sent'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info(`Password reset completed for user: ${user.email}`);

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during password reset'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword
};
