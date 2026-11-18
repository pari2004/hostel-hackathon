const express = require('express');
const { body } = require('express-validator');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  bulkUpdateUsers
} = require('../controllers/userController');

const { protect, authorize, checkPermission, logActivity } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createUserValidation = [
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
    .withMessage('Gender must be male, female, or other'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  body('permissions.*')
    .optional()
    .isIn([
      'view_attendance', 'manage_attendance', 'view_leaves', 'manage_leaves',
      'view_events', 'manage_events', 'view_announcements', 'manage_announcements',
      'manage_users', 'view_analytics'
    ])
    .withMessage('Invalid permission')
];

const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
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
    .withMessage('Gender must be male, female, or other'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  body('permissions.*')
    .optional()
    .isIn([
      'view_attendance', 'manage_attendance', 'view_leaves', 'manage_leaves',
      'view_events', 'manage_events', 'view_announcements', 'manage_announcements',
      'manage_users', 'view_analytics'
    ])
    .withMessage('Invalid permission')
];

const bulkUpdateValidation = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('User IDs array is required and must not be empty'),
  body('userIds.*')
    .isMongoId()
    .withMessage('Each user ID must be a valid MongoDB ObjectId'),
  body('updateData')
    .isObject()
    .withMessage('Update data must be an object')
];

// Apply authentication to all routes
router.use(protect);

// Routes accessible by admin and wardens
router.get('/', authorize('admin', 'warden'), logActivity('view_users'), getUsers);
router.get('/stats', authorize('admin', 'warden'), checkPermission('view_analytics'), getUserStats);

// Routes accessible by admin only
router.post('/', authorize('admin'), createUserValidation, logActivity('create_user'), createUser);
router.put('/bulk', authorize('admin'), bulkUpdateValidation, logActivity('bulk_update_users'), bulkUpdateUsers);

// Routes with specific access control
router.get('/:id', getUser); // Users can view their own profile, admin/warden can view any
router.put('/:id', updateUserValidation, logActivity('update_user'), updateUser); // Users can update their own profile, admin can update any
router.delete('/:id', authorize('admin'), logActivity('delete_user'), deleteUser);

module.exports = router;
