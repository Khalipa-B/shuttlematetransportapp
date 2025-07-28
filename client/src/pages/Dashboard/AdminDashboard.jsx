import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import { 
  Users, 
  Bus, 
  MapPin, 
  Calendar, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useUser()
  const [stats] = useState({
    totalStudents: 245,
    activeBuses: 12,
    totalDrivers: 15,
    completedTrips: 8,
    pendingTrips: 4,
    totalRoutes: 6
  })

  const [recentActivity] = useState([
    { id: 1, type: 'trip', message: 'Route A completed successfully', time: '10:30 AM', status: 'success' },
    { id: 2, type: 'alert', message: 'Bus #42 reported minor delay', time: '10:15 AM', status: 'warning' },
    { id: 3, type: 'user', message: 'New parent registered: Sarah Johnson', time: '9:45 AM', status: 'info' },
    { id: 4, type: 'trip', message: 'Route B started morning pickup', time: '8:30 AM', status: 'success' },
  ])

  const [buses] = useState([
    { id: 1, number: 'Bus #42', driver: 'John Smith', route: 'Route A', status: 'active', students: 18 },
    { id: 2, number: 'Bus #43', driver: 'Mary Johnson', route: 'Route B', status: 'active', students: 22 },
    { id: 3, number: 'Bus #44', driver: 'David Wilson', route: 'Route C', status: 'maintenance', students: 0 },
    { id: 4, number: 'Bus #45', driver: 'Lisa Brown', route: 'Route D', status: 'active', students: 20 },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Admin Dashboard" />
      <Sidebar userRole="admin" />
      
      <main className="ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600">
              Monitor and manage your school transport system from this central dashboard.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <Bus className="h-8 w-8 text-secondary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Buses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeBuses}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Routes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRoutes}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedTrips}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Fleet Status */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bus className="h-5 w-5 text-primary-600 mr-2" />
                Fleet Status
              </h2>
              <div className="space-y-3">
                {buses.map((bus) => (
                  <div key={bus.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        bus.status === 'active' ? 'bg-green-400' : 
                        bus.status === 'maintenance' ? 'bg-red-400' : 'bg-yellow-400'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{bus.number}</p>
                        <p className="text-sm text-gray-500">{bus.driver} • {bus.route}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{bus.students} students</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        bus.status === 'active' ? 'bg-green-100 text-green-800' :
                        bus.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bus.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 text-primary-600 mr-2" />
                Recent Activity
              </h2>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'success' ? 'bg-green-400' :
                        activity.status === 'warning' ? 'bg-yellow-400' :
                        activity.status === 'error' ? 'bg-red-400' : 'bg-blue-400'
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-500">Add or edit user accounts</p>
              </div>
            </button>

            <button className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-secondary-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Schedule Trips</h3>
                <p className="text-sm text-gray-500">Plan and assign routes</p>
              </div>
            </button>

            <button className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">View Reports</h3>
                <p className="text-sm text-gray-500">Analytics and insights</p>
              </div>
            </button>

            <button className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">System Alerts</h3>
                <p className="text-sm text-gray-500">Monitor issues</p>
              </div>
            </button>
          </div>

          {/* Performance Metrics */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 text-primary-600 mr-2" />
              Performance Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">98.5%</div>
                <div className="text-sm text-gray-600">On-Time Performance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">4.8/5</div>
                <div className="text-sm text-gray-600">Parent Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">99.2%</div>
                <div className="text-sm text-gray-600">Safety Record</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard