const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { protect, authRateLimit, logActivity } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .isIn(['student', 'warden', 'admin', 'parent'])
    .withMessage('Role must be student, warden, admin, or parent'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Student ID must be between 3 and 20 characters'),
  body('roomNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Room number must be between 1 and 10 characters'),
  body('course')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Course must be between 2 and 100 characters'),
  body('year')
    .optional()
    .isInt({ min: 1, max: 6 })
    .withMessage('Year must be between 1 and 6'),
  body('batch')
    .optional()
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Batch must be between 4 and 20 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Public routes
router.post('/register', authRateLimit(3, 15 * 60 * 1000), registerValidation, register);
router.post('/login', authRateLimit(5, 15 * 60 * 1000), loginValidation, login);
router.post('/forgotpassword', authRateLimit(3, 60 * 60 * 1000), forgotPasswordValidation, forgotPassword);
router.put('/resetpassword/:resettoken', authRateLimit(3, 15 * 60 * 1000), resetPasswordValidation, resetPassword);

// Protected routes
router.get('/logout', protect, logActivity('logout'), logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, logActivity('update_profile'), updateDetails);
router.put('/updatepassword', protect, updatePasswordValidation, logActivity('update_password'), updatePassword);

module.exports = router;
