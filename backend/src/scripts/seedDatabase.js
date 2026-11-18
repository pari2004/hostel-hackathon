const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  // Admin User
  {
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@hostel.com',
    phone: '+91-9876543210',
    password: 'admin123',
    role: 'admin',
    permissions: [
      'view_attendance', 'manage_attendance', 'view_leaves', 'manage_leaves',
      'view_events', 'manage_events', 'view_announcements', 'manage_announcements',
      'manage_users', 'view_analytics'
    ],
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true
  },
  
  // Warden Users
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'warden1@hostel.com',
    phone: '+91-9876543211',
    password: 'warden123',
    role: 'warden',
    department: 'Hostel Management',
    assignedBlocks: ['Block A', 'Block B'],
    permissions: [
      'view_attendance', 'manage_attendance', 'view_leaves', 'manage_leaves',
      'view_events', 'manage_events', 'view_announcements', 'manage_announcements'
    ],
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'warden2@hostel.com',
    phone: '+91-9876543212',
    password: 'warden123',
    role: 'warden',
    department: 'Hostel Management',
    assignedBlocks: ['Block C', 'Block D'],
    permissions: [
      'view_attendance', 'manage_attendance', 'view_leaves', 'manage_leaves',
      'view_events', 'manage_events', 'view_announcements', 'manage_announcements'
    ],
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true
  },
  
  // Student Users
  {
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul.sharma@student.com',
    phone: '+91-9876543213',
    password: 'student123',
    role: 'student',
    studentId: 'STU001',
    roomNumber: 'A101',
    course: 'Computer Science',
    year: 2,
    batch: '2022-2026',
    permissions: ['view_attendance', 'view_leaves', 'view_events', 'view_announcements'],
    dateOfBirth: new Date('2003-05-15'),
    gender: 'male',
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '400001'
    },
    emergencyContact: {
      name: 'Suresh Sharma',
      relationship: 'Father',
      phone: '+91-9876543214',
      email: 'suresh.sharma@email.com'
    },
    isActive: true,
    isEmailVerified: true
  },
  {
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.patel@student.com',
    phone: '+91-9876543215',
    password: 'student123',
    role: 'student',
    studentId: 'STU002',
    roomNumber: 'A102',
    course: 'Information Technology',
    year: 3,
    batch: '2021-2025',
    permissions: ['view_attendance', 'view_leaves', 'view_events', 'view_announcements'],
    dateOfBirth: new Date('2002-08-22'),
    gender: 'female',
    address: {
      street: '456 Park Avenue',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '411001'
    },
    emergencyContact: {
      name: 'Meera Patel',
      relationship: 'Mother',
      phone: '+91-9876543216',
      email: 'meera.patel@email.com'
    },
    isActive: true,
    isEmailVerified: true
  },
  {
    firstName: 'Amit',
    lastName: 'Kumar',
    email: 'amit.kumar@student.com',
    phone: '+91-9876543217',
    password: 'student123',
    role: 'student',
    studentId: 'STU003',
    roomNumber: 'B201',
    course: 'Electronics Engineering',
    year: 1,
    batch: '2023-2027',
    permissions: ['view_attendance', 'view_leaves', 'view_events', 'view_announcements'],
    dateOfBirth: new Date('2004-12-10'),
    gender: 'male',
    address: {
      street: '789 College Road',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      zipCode: '110001'
    },
    emergencyContact: {
      name: 'Rajesh Kumar',
      relationship: 'Father',
      phone: '+91-9876543218',
      email: 'rajesh.kumar@email.com'
    },
    isActive: true,
    isEmailVerified: true
  },
  
  // Parent Users
  {
    firstName: 'Suresh',
    lastName: 'Sharma',
    email: 'suresh.sharma@email.com',
    phone: '+91-9876543214',
    password: 'parent123',
    role: 'parent',
    permissions: ['view_attendance', 'view_leaves'],
    isActive: true,
    isEmailVerified: true
  }
];

const sampleEvents = [
  {
    title: 'Annual Cultural Fest',
    description: 'Join us for our annual cultural festival featuring music, dance, drama, and art competitions. This is a celebration of creativity and talent from all students.',
    shortDescription: 'Annual cultural festival with music, dance, and art competitions',
    eventType: 'cultural',
    category: 'optional',
    startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    endDateTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
    registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    venue: {
      name: 'Main Auditorium',
      address: {
        street: 'Hostel Campus',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      },
      capacity: 500
    },
    requiresRegistration: true,
    maxParticipants: 200,
    registrationFee: {
      amount: 100,
      currency: 'INR'
    },
    eligibility: {
      roles: ['student'],
      gender: 'all'
    },
    status: 'published',
    requirements: ['Student ID', 'Registration Fee'],
    instructions: ['Report to venue 30 minutes early', 'Bring your own water bottle'],
    contactInfo: {
      email: 'events@hostel.com',
      phone: '+91-9876543220'
    }
  },
  {
    title: 'Inter-Block Sports Tournament',
    description: 'Compete in various sports including cricket, football, basketball, and badminton. Show your sporting spirit and represent your block!',
    shortDescription: 'Inter-block sports competition',
    eventType: 'sports',
    category: 'optional',
    startDateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    endDateTime: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
    registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    venue: {
      name: 'Sports Complex',
      address: {
        street: 'Hostel Campus',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      },
      capacity: 300
    },
    requiresRegistration: true,
    maxParticipants: 150,
    eligibility: {
      roles: ['student'],
      gender: 'all'
    },
    status: 'published',
    requirements: ['Sports attire', 'Medical certificate'],
    instructions: ['Warm up before events', 'Stay hydrated'],
    contactInfo: {
      email: 'sports@hostel.com',
      phone: '+91-9876543221'
    }
  }
];

const sampleAnnouncements = [
  {
    title: 'Welcome to New Academic Year',
    content: 'We welcome all new and returning students to the hostel for the new academic year. Please ensure you have completed all registration formalities and familiarize yourself with the hostel rules and regulations.',
    summary: 'Welcome message for new academic year',
    type: 'general',
    priority: 'high',
    targetAudience: {
      roles: ['student', 'all']
    },
    status: 'published',
    isPinned: true,
    tags: ['welcome', 'academic-year', 'registration']
  },
  {
    title: 'Hostel Wi-Fi Maintenance',
    content: 'The hostel Wi-Fi will undergo scheduled maintenance on Sunday from 2:00 AM to 6:00 AM. Internet services may be intermittent during this period. We apologize for any inconvenience.',
    summary: 'Scheduled Wi-Fi maintenance on Sunday',
    type: 'maintenance',
    priority: 'medium',
    targetAudience: {
      roles: ['student', 'all']
    },
    status: 'published',
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
    tags: ['maintenance', 'wifi', 'internet']
  },
  {
    title: 'New Mess Menu',
    content: 'We are excited to introduce our new mess menu with more variety and healthier options. The new menu includes regional cuisines and special dietary options. Please check the notice board for detailed menu.',
    summary: 'New mess menu with more variety introduced',
    type: 'general',
    priority: 'medium',
    targetAudience: {
      roles: ['student', 'all']
    },
    status: 'published',
    tags: ['mess', 'food', 'menu', 'health']
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Event.deleteMany({});
    await Announcement.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users
    const createdUsers = await User.create(sampleUsers);
    console.log(`Created ${createdUsers.length} users`);
    
    // Update parent-child relationships
    const parent = createdUsers.find(user => user.role === 'parent');
    const student = createdUsers.find(user => user.studentId === 'STU001');
    if (parent && student) {
      parent.children = [student._id];
      await parent.save();
      console.log('Updated parent-child relationship');
    }
    
    // Create events with organizer
    const organizer = createdUsers.find(user => user.role === 'warden');
    const eventsWithOrganizer = sampleEvents.map(event => ({
      ...event,
      organizer: organizer._id
    }));
    
    const createdEvents = await Event.create(eventsWithOrganizer);
    console.log(`Created ${createdEvents.length} events`);
    
    // Create announcements with author
    const author = createdUsers.find(user => user.role === 'admin');
    const announcementsWithAuthor = sampleAnnouncements.map(announcement => ({
      ...announcement,
      author: author._id,
      authorRole: 'admin'
    }));
    
    const createdAnnouncements = await Announcement.create(announcementsWithAuthor);
    console.log(`Created ${createdAnnouncements.length} announcements`);
    
    // Create sample attendance records for the last 7 days
    const students = createdUsers.filter(user => user.role === 'student');
    const attendanceRecords = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      for (const student of students) {
        // 90% attendance rate
        if (Math.random() > 0.1) {
          const checkInTime = new Date(date);
          checkInTime.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
          
          const checkOutTime = new Date(date);
          checkOutTime.setHours(17 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));
          
          attendanceRecords.push({
            user: student._id,
            studentId: student.studentId,
            date: date,
            checkInTime: checkInTime,
            checkOutTime: checkOutTime,
            checkInMethod: 'facial_recognition',
            checkOutMethod: 'facial_recognition',
            status: 'present'
          });
        }
      }
    }
    
    if (attendanceRecords.length > 0) {
      await Attendance.create(attendanceRecords);
      console.log(`Created ${attendanceRecords.length} attendance records`);
    }
    
    console.log('Database seeding completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@hostel.com / admin123');
    console.log('Warden: warden1@hostel.com / warden123');
    console.log('Student: rahul.sharma@student.com / student123');
    console.log('Parent: suresh.sharma@email.com / parent123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding
connectDB().then(() => {
  seedDatabase();
});
