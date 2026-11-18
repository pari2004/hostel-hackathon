const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Hostel Management System API is running!',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// Test auth route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    data: {
      server: 'Express.js',
      database: 'MongoDB (not connected in demo mode)',
      features: [
        'User Authentication',
        'Attendance Tracking',
        'Leave Management',
        'Event Management',
        'Announcements'
      ]
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at: http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});
