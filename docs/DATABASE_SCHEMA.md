# Database Schema Documentation

## Overview

The Hostel Management System uses MongoDB as the primary database with Mongoose ODM for schema definition and data modeling. The database is designed to handle user management, attendance tracking, leave management, event organization, and community features.

## Collections

### 1. Users Collection

**Purpose**: Store user information for students, wardens, administrators, and parents.

**Key Fields**:
- `firstName`, `lastName`: User's name
- `email`: Unique email address (used for login)
- `phone`: Contact number
- `password`: Hashed password
- `role`: User role (student, warden, admin, parent)
- `studentId`: Unique student identifier (for students)
- `roomNumber`: Hostel room assignment
- `course`, `year`, `batch`: Academic information
- `faceDescriptors`: Facial recognition data
- `permissions`: Role-based permissions array
- `emergencyContact`: Emergency contact information

**Indexes**:
- `email` (unique)
- `studentId` (unique, sparse)
- `role`
- `roomNumber`

### 2. Attendance Collection

**Purpose**: Track daily attendance records with multiple check-in methods.

**Key Fields**:
- `user`: Reference to User document
- `studentId`: Student identifier
- `date`: Attendance date
- `checkInTime`, `checkOutTime`: Entry/exit timestamps
- `checkInMethod`, `checkOutMethod`: Method used (facial_recognition, qr_code, nfc, manual)
- `status`: Attendance status (present, absent, late, early_departure, on_leave)
- `faceRecognition`: Facial recognition confidence and metadata
- `location`: GPS coordinates for check-in/out
- `duration`: Total time spent (in minutes)

**Indexes**:
- `user` + `date` (unique compound)
- `studentId` + `date`
- `date` + `status`
- `checkInTime`

### 3. Leave Collection

**Purpose**: Manage leave applications and approval workflow.

**Key Fields**:
- `user`: Reference to User document
- `leaveType`: Type of leave (sick_leave, casual_leave, emergency_leave, etc.)
- `startDate`, `endDate`: Leave duration
- `totalDays`: Calculated leave duration
- `reason`: Leave reason
- `status`: Application status (pending, approved, rejected, cancelled)
- `approvals`: Approval chain with multiple approvers
- `attachments`: Supporting documents
- `contactDuringLeave`: Contact information during leave
- `extensionRequests`: Leave extension requests

**Indexes**:
- `user` + `startDate`
- `studentId` + `status`
- `status` + `startDate`
- `leaveType`

### 4. Events Collection

**Purpose**: Manage hostel events, registrations, and participation.

**Key Fields**:
- `title`, `description`: Event information
- `eventType`: Type of event (cultural, sports, academic, etc.)
- `startDateTime`, `endDateTime`: Event schedule
- `venue`: Location details with GPS coordinates
- `organizer`: Event organizer reference
- `registrations`: Array of user registrations with status
- `maxParticipants`: Registration limit
- `requiresRegistration`: Whether registration is needed
- `eligibility`: Eligibility criteria (roles, courses, years)
- `status`: Event status (draft, published, ongoing, completed)

**Indexes**:
- `startDateTime` + `status`
- `eventType` + `status`
- `organizer`
- `venue.coordinates` (2dsphere for geospatial queries)

### 5. Announcements Collection

**Purpose**: Manage hostel announcements and communications.

**Key Fields**:
- `title`, `content`: Announcement content
- `author`: Author reference
- `type`: Announcement type (general, urgent, maintenance, etc.)
- `priority`: Priority level (low, medium, high, critical)
- `targetAudience`: Target audience criteria
- `publishDate`, `expiryDate`: Publication schedule
- `status`: Publication status (draft, published, archived)
- `views`: View tracking with user references
- `reactions`: User reactions (like, love, helpful, etc.)
- `comments`: User comments with approval status

**Indexes**:
- `publishDate` + `status`
- `author` + `status`
- `type` + `priority`
- `isPinned` + `publishDate`

## Relationships

### User Relationships
```
User (Parent) ←→ User (Student)  [children array]
User (Warden) → User (Students)  [assignedBlocks]
```

### Attendance Relationships
```
User → Attendance  [one-to-many]
Leave → Attendance  [related attendance records]
```

### Leave Relationships
```
User → Leave  [one-to-many]
User (Approver) → Leave  [approval workflow]
```

### Event Relationships
```
User (Organizer) → Event  [one-to-many]
User → Event  [many-to-many via registrations]
```

### Announcement Relationships
```
User (Author) → Announcement  [one-to-many]
User → Announcement  [many-to-many via views/reactions]
Event ←→ Announcement  [related content]
```

## Data Types and Validation

### Common Patterns
- **ObjectId References**: Used for relationships between collections
- **Timestamps**: Automatic `createdAt` and `updatedAt` fields
- **Enum Validation**: Restricted values for status fields
- **Email Validation**: Regex pattern for email format
- **Phone Validation**: Regex pattern for phone numbers
- **String Length Limits**: Maximum character limits for text fields

### Geospatial Data
- **Location Fields**: GeoJSON Point format for coordinates
- **2dsphere Indexes**: For location-based queries

### File Attachments
- **Attachment Schema**: Standardized file metadata
  - `filename`: System-generated filename
  - `originalName`: User-provided filename
  - `mimeType`: File type
  - `size`: File size in bytes
  - `url`: File storage URL

## Performance Considerations

### Indexing Strategy
1. **Compound Indexes**: For frequently queried field combinations
2. **Sparse Indexes**: For optional unique fields (e.g., studentId)
3. **Geospatial Indexes**: For location-based queries
4. **Text Indexes**: For search functionality (future enhancement)

### Query Optimization
1. **Population Limits**: Selective field population to reduce data transfer
2. **Pagination**: Limit and skip for large result sets
3. **Aggregation Pipelines**: For complex analytics queries
4. **Lean Queries**: Return plain objects instead of Mongoose documents when possible

## Security Measures

### Data Protection
1. **Password Hashing**: bcrypt with salt rounds
2. **Sensitive Data**: Excluded from JSON serialization (`select: false`)
3. **Input Sanitization**: Mongoose sanitization and XSS protection
4. **Field Validation**: Comprehensive validation rules

### Access Control
1. **Role-based Permissions**: Granular permission system
2. **Document-level Security**: User can only access their own data
3. **Audit Trail**: Timestamps and user tracking for modifications

## Backup and Recovery

### Backup Strategy
1. **Daily Backups**: Automated daily database backups
2. **Point-in-time Recovery**: MongoDB replica set configuration
3. **Data Export**: Regular exports for disaster recovery

### Data Retention
1. **Attendance Records**: Retain for academic year + 2 years
2. **Leave Records**: Retain for 5 years for audit purposes
3. **Event Data**: Archive after 1 year
4. **Announcements**: Auto-expire based on expiry date

## Migration Scripts

### Schema Updates
- Version-controlled migration scripts
- Backward compatibility considerations
- Data transformation utilities

### Sample Migration
```javascript
// Example: Add new field to existing documents
db.users.updateMany(
  { preferences: { $exists: false } },
  { $set: { preferences: { notifications: { email: true, sms: true, push: true } } } }
);
```

## Analytics and Reporting

### Aggregation Pipelines
1. **Attendance Analytics**: Daily, weekly, monthly reports
2. **Leave Statistics**: Leave patterns and trends
3. **Event Analytics**: Participation rates and feedback
4. **User Engagement**: Activity tracking and metrics

### Performance Metrics
1. **Query Performance**: Monitor slow queries
2. **Index Usage**: Track index effectiveness
3. **Storage Growth**: Monitor database size trends
4. **Connection Pooling**: Optimize connection usage

## Future Enhancements

### Planned Features
1. **Full-text Search**: Implement text indexes for search functionality
2. **Data Archiving**: Automated archiving of old records
3. **Real-time Analytics**: Streaming analytics for live dashboards
4. **Multi-tenancy**: Support for multiple hostel instances

### Scalability Considerations
1. **Sharding Strategy**: Horizontal scaling plan
2. **Read Replicas**: Separate read and write operations
3. **Caching Layer**: Redis integration for frequently accessed data
4. **Microservices**: Split into domain-specific databases
