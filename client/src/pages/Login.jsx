import React from 'react'
import { SignIn, SignUp } from '@clerk/clerk-react'
import { Bus } from 'lucide-react'

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center mb-6">
          <Bus className="h-12 w-12 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">ShuttleMate</h1>
        </div>
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-sm text-gray-600 mb-8">
          Sign in to access your school transport dashboard
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignIn 
            routing="path" 
            path="/login"
            redirectUrl="/parent-dashboard"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary-600 hover:bg-primary-700',
                card: 'shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
              }
            }}
          />
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
              Contact your school administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login