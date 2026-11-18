# Development Setup Guide

## Prerequisites

Before setting up the development environment, ensure you have the following installed:

### Required Software
- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn**
- **MongoDB** (v5.0 or higher)
- **Git**
- **Python** (v3.8+ for AI models)

### For Mobile Development
- **React Native CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)
- **Java Development Kit (JDK)** (v11 or higher)

### Optional Tools
- **MongoDB Compass** (GUI for MongoDB)
- **Postman** (API testing)
- **VS Code** (recommended IDE)

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hostel-management-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install-all
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `.env` file with connection string

### 4. Environment Configuration

#### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel_management
JWT_SECRET=your_super_secret_jwt_key_here
# ... other configurations
```

#### Web Dashboard Configuration
```bash
cd web-dashboard
# Create .env file if needed
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

#### Mobile App Configuration
```bash
cd mobile-app
# Create .env file if needed
echo "API_URL=http://localhost:5000/api" > .env
```

### 5. AI Models Setup

#### Download Pre-trained Models
```bash
# Create AI models directory
mkdir -p ai-models/facial-recognition

# Download face-api.js models (this will be automated in the future)
# For now, manually download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
```

#### Python Dependencies (for AI training)
```bash
# Create virtual environment
python -m venv ai-env
source ai-env/bin/activate  # On Windows: ai-env\Scripts\activate

# Install Python dependencies
pip install tensorflow opencv-python numpy pandas scikit-learn
```

## Running the Application

### Development Mode

#### Start All Services
```bash
# From root directory
npm run dev
```

This will start:
- Backend API server on `http://localhost:5000`
- Web dashboard on `http://localhost:3000`

#### Start Individual Services

**Backend Only:**
```bash
cd backend
npm run dev
```

**Web Dashboard Only:**
```bash
cd web-dashboard
npm start
```

**Mobile App:**
```bash
cd mobile-app

# For Android
npm run android

# For iOS (macOS only)
npm run ios
```

### Production Mode

#### Build Applications
```bash
npm run build
```

#### Start Production Server
```bash
cd backend
npm start
```

## Mobile Development Setup

### Android Setup

1. **Install Android Studio**
2. **Configure Android SDK**
3. **Set up Android Virtual Device (AVD)**
4. **Configure environment variables:**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### iOS Setup (macOS only)

1. **Install Xcode** from App Store
2. **Install Xcode Command Line Tools:**
   ```bash
   xcode-select --install
   ```
3. **Install CocoaPods:**
   ```bash
   sudo gem install cocoapods
   ```
4. **Install iOS dependencies:**
   ```bash
   cd mobile-app/ios
   pod install
   ```

## Database Seeding

### Create Initial Data
```bash
cd backend
npm run seed
```

This will create:
- Admin user account
- Sample student accounts
- Sample warden accounts
- Test events and announcements

### Default Accounts
- **Admin**: admin@hostel.com / admin123
- **Warden**: warden@hostel.com / warden123
- **Student**: student@hostel.com / student123

## Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Web dashboard tests
cd web-dashboard
npm test

# Mobile app tests
cd mobile-app
npm test
```

### Test Coverage
```bash
# Backend test coverage
cd backend
npm run test:coverage
```

## Code Quality

### Linting
```bash
# Lint all projects
npm run lint

# Fix linting issues
npm run lint:fix
```

### Formatting
```bash
# Format web dashboard code
cd web-dashboard
npm run format
```

## Debugging

### Backend Debugging
1. Use VS Code debugger with Node.js configuration
2. Set breakpoints in your code
3. Start debugging session

### Frontend Debugging
1. Use browser developer tools
2. React Developer Tools extension
3. Redux DevTools extension

### Mobile Debugging
1. **React Native Debugger**
2. **Flipper** (Facebook's debugging platform)
3. **Chrome DevTools** for JavaScript debugging

## Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000
npx kill-port 3000
```

### MongoDB Connection Issues
1. Ensure MongoDB service is running
2. Check connection string in `.env`
3. Verify network connectivity

### React Native Build Issues
```bash
# Clean React Native cache
npx react-native start --reset-cache

# Clean Android build
cd mobile-app/android
./gradlew clean

# Clean iOS build (macOS only)
cd mobile-app/ios
xcodebuild clean
```

### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### 1. Feature Development
1. Create feature branch from `develop`
2. Implement feature with tests
3. Run linting and tests
4. Create pull request

### 2. Code Review Process
1. Automated tests must pass
2. Code review by team member
3. Merge to `develop` branch

### 3. Release Process
1. Merge `develop` to `main`
2. Tag release version
3. Deploy to production

## Useful Commands

```bash
# Install new dependency
npm install package-name

# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix security vulnerabilities
npm audit fix

# Generate API documentation
npm run docs

# Database backup
mongodump --db hostel_management

# Database restore
mongorestore --db hostel_management dump/hostel_management
```

## VS Code Extensions (Recommended)

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- MongoDB for VS Code
- Thunder Client (API testing)
- GitLens
- Auto Rename Tag
- Bracket Pair Colorizer

## Next Steps

After completing the setup:
1. Explore the codebase structure
2. Run the application and test basic functionality
3. Review the API documentation
4. Set up your development workflow
5. Start contributing to the project

For more detailed information, refer to:
- [API Documentation](./API_DOCUMENTATION.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
