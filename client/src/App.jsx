import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import Home from './pages/Home'
import Login from './pages/Login'
import ParentDashboard from './pages/Dashboard/ParentDashboard'
import DriverDashboard from './pages/Dashboard/DriverDashboard'
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/parent-dashboard" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/driver-dashboard" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App