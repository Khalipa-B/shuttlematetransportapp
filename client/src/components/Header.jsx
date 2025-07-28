import React from 'react'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Bus, Bell } from 'lucide-react'

const Header = ({ title }) => {
  const { user } = useUser()
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Bus className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">ShuttleMate</h1>
              {title && <p className="text-sm text-gray-500">{title}</p>}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">
                Welcome, {user?.firstName || 'User'}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header