// Export all models from a single file for easier imports
const User = require('./User');
const Attendance = require('./Attendance');
const Leave = require('./Leave');
const Event = require('./Event');
const Announcement = require('./Announcement');

module.exports = {
  User,
  Attendance,
  Leave,
  Event,
  Announcement
};
