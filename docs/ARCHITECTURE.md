# System Architecture

## Overview

The Hostel Management System is built using a microservices-inspired architecture with clear separation between frontend applications and backend services.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │  Web Dashboard  │    │   Admin Panel   │
│  (React Native) │    │   (React.js)    │    │   (React.js)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      API Gateway          │
                    │    (Express.js + CORS)    │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
    ┌─────┴─────┐         ┌─────┴─────┐         ┌─────┴─────┐
    │   Auth    │         │   Core    │         │    AI     │
    │ Service   │         │ Services  │         │ Services  │
    └───────────┘         └───────────┘         └───────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      Database Layer       │
                    │      (MongoDB)            │
                    └───────────────────────────┘
```

## Components

### 1. Frontend Applications

#### Mobile App (React Native)
- **Purpose**: Primary interface for students and parents
- **Features**:
  - Attendance tracking via camera
  - Leave applications
  - Event participation
  - Real-time notifications
  - QR code scanning

#### Web Dashboard (React.js)
- **Purpose**: Administrative interface for wardens and staff
- **Features**:
  - Attendance monitoring
  - Leave management
  - Event organization
  - Analytics and reporting
  - User management

### 2. Backend Services

#### API Gateway (Express.js)
- **Purpose**: Central entry point for all client requests
- **Responsibilities**:
  - Request routing
  - Authentication middleware
  - Rate limiting
  - CORS handling
  - Request/response logging

#### Authentication Service
- **Purpose**: Handle user authentication and authorization
- **Features**:
  - JWT token management
  - Role-based access control
  - Password encryption
  - Session management

#### Core Services
- **User Management**: CRUD operations for users
- **Attendance Service**: Attendance tracking and reporting
- **Leave Management**: Leave applications and approvals
- **Event Management**: Event creation and participation
- **Notification Service**: Real-time notifications

#### AI Services
- **Facial Recognition**: Face detection and recognition
- **Image Processing**: Image preprocessing and analysis
- **Analytics**: Attendance pattern analysis

### 3. Database Layer

#### MongoDB
- **Collections**:
  - `users`: User profiles and authentication data
  - `attendance`: Daily attendance records
  - `leaves`: Leave applications and approvals
  - `events`: Event information and RSVPs
  - `announcements`: Hostel announcements
  - `notifications`: User notifications

## Data Flow

### 1. Authentication Flow
```
Client → API Gateway → Auth Service → Database → Response
```

### 2. Attendance Recording Flow
```
Mobile App → Camera → AI Service → Attendance Service → Database → Notification Service
```

### 3. Leave Application Flow
```
Mobile App → API Gateway → Leave Service → Notification Service → Web Dashboard
```

## Security Architecture

### 1. Authentication & Authorization
- JWT tokens for stateless authentication
- Role-based access control (RBAC)
- Refresh token rotation
- Password hashing with bcrypt

### 2. Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### 3. File Upload Security
- File type validation
- Size limitations
- Virus scanning
- Secure file storage

## Scalability Considerations

### 1. Horizontal Scaling
- Stateless API design
- Load balancer ready
- Database connection pooling
- Caching strategies

### 2. Performance Optimization
- Image compression
- Lazy loading
- Database indexing
- CDN for static assets

## Deployment Architecture

### Development Environment
```
Local Machine → Docker Containers → Local Database
```

### Production Environment
```
Load Balancer → Multiple API Instances → Database Cluster → File Storage
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **AI/ML**: TensorFlow.js, OpenCV

### Frontend
- **Web**: React.js + Material-UI
- **Mobile**: React Native + React Native Elements
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Cloud**: AWS/Google Cloud
- **Monitoring**: PM2, Winston

## API Design

### RESTful Endpoints
```
GET    /api/users              # Get all users
POST   /api/users              # Create user
GET    /api/users/:id          # Get user by ID
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user

POST   /api/attendance         # Record attendance
GET    /api/attendance/:userId # Get user attendance
GET    /api/attendance/reports # Get attendance reports

POST   /api/leaves             # Apply for leave
GET    /api/leaves             # Get leave applications
PUT    /api/leaves/:id         # Update leave status
```

### WebSocket Events
```
connection          # Client connects
join-room           # Join specific room
attendance-update   # Real-time attendance update
leave-notification  # Leave status notification
event-reminder      # Event reminders
disconnect          # Client disconnects
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2023-08-25T10:30:00Z"
}
```

### Error Types
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

## Monitoring & Logging

### Logging Strategy
- Structured logging with Winston
- Log levels: error, warn, info, debug
- Centralized log aggregation
- Error tracking and alerting

### Performance Monitoring
- API response times
- Database query performance
- Memory and CPU usage
- User activity tracking
