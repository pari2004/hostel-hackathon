// Demo data store for when MongoDB is not available
let users = [];
let attendance = [];
let leaves = [];
let events = [];
let announcements = [];

// Sample users for demo
const sampleUsers = [
  {
    _id: 'admin001',
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@hostel.com',
    phone: '+91-9876543210',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // admin123
    role: 'admin',
    permissions: [
      'view_attendance', 'manage_attendance', 'view_leaves', 'manage_leaves',
      'view_events', 'manage_events', 'view_announcements', 'manage_announcements',
      'manage_users', 'view_analytics'
    ],
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    _id: 'warden001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'warden@hostel.com',
    phone: '+91-9876543211',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // warden123
    role: 'warden',
    department: 'Hostel Management',
    assignedBlocks: ['Block A', 'Block B'],
    permissions: [
      'view_attendance', 'manage_attendance', 'view_leaves', 'manage_leaves',
      'view_events', 'manage_events', 'view_announcements', 'manage_announcements'
    ],
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    _id: 'student001',
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul.sharma@student.com',
    phone: '+91-9876543213',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // student123
    role: 'student',
    studentId: 'STU001',
    roomNumber: 'A101',
    course: 'Computer Science',
    year: 2,
    batch: '2022-2026',
    permissions: ['view_attendance', 'view_leaves', 'view_events', 'view_announcements'],
    dateOfBirth: new Date('2003-05-15'),
    gender: 'male',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
];

// Initialize demo data
const initDemoData = () => {
  users = [...sampleUsers];
  
  // Sample announcements
  announcements = [
    {
      _id: 'ann001',
      title: 'Welcome to New Academic Year',
      content: 'We welcome all new and returning students to the hostel for the new academic year.',
      author: 'admin001',
      authorRole: 'admin',
      type: 'general',
      priority: 'high',
      status: 'published',
      isPinned: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  // Sample events
  events = [
    {
      _id: 'evt001',
      title: 'Annual Cultural Fest',
      description: 'Join us for our annual cultural festival featuring music, dance, drama, and art competitions.',
      eventType: 'cultural',
      startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      organizer: 'warden001',
      status: 'published',
      venue: {
        name: 'Main Auditorium',
        capacity: 500
      },
      registrations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  console.log('Demo data initialized');
};

// Demo data access functions
const demoData = {
  users: {
    find: (query = {}) => {
      let result = users;
      if (query.email) result = result.filter(u => u.email === query.email);
      if (query.role) result = result.filter(u => u.role === query.role);
      if (query._id) result = result.filter(u => u._id === query._id);
      return result;
    },
    findOne: (query) => {
      const result = demoData.users.find(query);
      return result.length > 0 ? result[0] : null;
    },
    create: (userData) => {
      const newUser = {
        _id: 'user' + Date.now(),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      users.push(newUser);
      return newUser;
    },
    findById: (id) => {
      return users.find(u => u._id === id) || null;
    },
    countDocuments: (query = {}) => {
      return demoData.users.find(query).length;
    }
  },
  
  announcements: {
    find: (query = {}) => {
      let result = announcements;
      if (query.status) result = result.filter(a => a.status === query.status);
      return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  
  events: {
    find: (query = {}) => {
      let result = events;
      if (query.status) result = result.filter(e => e.status === query.status);
      return result.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
    }
  },
  
  attendance: {
    find: () => attendance,
    countDocuments: () => attendance.length
  },
  
  leaves: {
    find: () => leaves,
    countDocuments: () => leaves.length
  }
};

module.exports = {
  initDemoData,
  demoData,
  isDemoMode: () => true
};
