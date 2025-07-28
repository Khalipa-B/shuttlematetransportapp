# ShuttleMate - School Transport Management System

A comprehensive school transport management system built with React, Node.js, MongoDB, and Clerk authentication.

## 🚌 Features

### Core Functionality
- **Role-based Authentication**: Parents, Drivers, and Admins with Clerk.com
- **Real-time GPS Tracking**: Live bus location tracking
- **Student Management**: Check-in/check-out logs and attendance tracking
- **Trip Scheduling**: Admin-to-driver trip assignments
- **Real-time Chat**: Socket.IO powered communication between users
- **Notifications**: Email and in-app notifications

### User Dashboards
- **Parent Dashboard**: Track children, chat with drivers/admins, view schedules
- **Driver Dashboard**: Route assignments, student check-ins, real-time updates
- **Admin Dashboard**: User management, trip planning, fleet monitoring

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS v3** for styling
- **Clerk React** for authentication
- **Socket.IO Client** for real-time features
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **Clerk SDK** for authentication
- **Helmet** for security
- **CORS** for cross-origin requests

## 📁 Project Structure

```
shuttlemate-mobility-app/
├── client/                         # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Dashboard/
│   │   │       ├── ParentDashboard.jsx
│   │   │       ├── DriverDashboard.jsx
│   │   │       └── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.local
│   └── package.json
│
├── server/                         # Express Backend
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── tripController.js
│   │   ├── userController.js
│   │   └── studentController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Trip.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── tripRoutes.js
│   │   └── studentRoutes.js
│   ├── utils/
│   │   └── socket.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Clerk.com account

### Installation

1. **Clone and install dependencies**:
```bash
npm run install:all
```

2. **Set up environment variables**:

**Client (.env.local)**:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
VITE_API_URL=http://localhost:5000
```

**Server (.env)**:
```env
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/shuttlemate
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

3. **Start development servers**:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🔐 Authentication Setup

### Clerk Configuration
1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Enable Google OAuth provider
3. Set up user metadata for roles (parent, driver, admin)
4. Configure redirect URLs:
   - Sign-in: `http://localhost:5173/parent-dashboard`
   - Sign-up: `http://localhost:5173/parent-dashboard`

### User Roles
- **Parent**: Default role, can track children and communicate
- **Driver**: Can manage routes and check-in students
- **Admin**: Full system access and user management

## 📊 Database Schema

### Collections
- **Users**: User profiles with role-based access
- **Students**: Student information and assignments
- **Trips**: Route schedules and real-time tracking
- **Attendance**: Check-in/out logs and history

## 🔄 Real-time Features

### Socket.IO Events
- `locationUpdate`: Live GPS tracking
- `studentCheckedIn/Out`: Attendance updates
- `newMessage`: Chat messages
- `tripStatusChanged`: Route status updates
- `emergencyAlert`: Safety notifications

## 🛡 Security Features

- **Clerk JWT Authentication**: Secure user sessions
- **Role-based Access Control**: Route-level permissions
- **Rate Limiting**: API protection
- **Helmet**: Security headers
- **Input Validation**: Mongoose schema validation

## 📱 API Endpoints

### Authentication
- `POST /api/auth/sync` - Sync Clerk user to MongoDB
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `POST /api/students/:id/checkin` - Check-in student
- `POST /api/students/:id/checkout` - Check-out student

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create trip
- `PUT /api/trips/:id/location` - Update GPS location
- `PUT /api/trips/:id/start` - Start trip
- `PUT /api/trips/:id/complete` - Complete trip

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy to Vercel
```

### Backend (Render)
```bash
cd server
# Deploy to Render with environment variables
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@shuttlemate.com or create an issue in the repository.

---

**ShuttleMate** - Making school transport safer and more efficient! 🚌✨