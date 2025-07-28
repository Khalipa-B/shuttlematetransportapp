import React from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { Bus, Shield, MapPin, MessageCircle, Users, Clock } from 'lucide-react'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-primary-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">ShuttleMate</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <SignedOut>
                <Link to="/login" className="btn-primary">
                  Sign In
                </Link>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Safe School Transport
              <span className="block text-primary-200">Made Simple</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Track your child's school bus in real-time, communicate with drivers, 
              and ensure safe transportation with ShuttleMate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignedOut>
                <Link to="/login" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                  Get Started Free
                </Link>
              </SignedOut>
              <SignedIn>
                <Link to="/parent-dashboard" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                  Go to Dashboard
                </Link>
              </SignedIn>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Safe Transport
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive school transport management with real-time tracking, 
              communication, and safety features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center">
              <MapPin className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600">
                Track your child's bus location in real-time with GPS accuracy and live updates.
              </p>
            </div>

            <div className="card text-center">
              <MessageCircle className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instant Communication</h3>
              <p className="text-gray-600">
                Chat directly with drivers and school administrators for quick updates.
              </p>
            </div>

            <div className="card text-center">
              <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Safety First</h3>
              <p className="text-gray-600">
                Automated check-in/out logs and safety notifications for peace of mind.
              </p>
            </div>

            <div className="card text-center">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-Role Access</h3>
              <p className="text-gray-600">
                Separate dashboards for parents, drivers, and administrators.
              </p>
            </div>

            <div className="card text-center">
              <Clock className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Schedule Management</h3>
              <p className="text-gray-600">
                Automated scheduling and route optimization for efficient transport.
              </p>
            </div>

            <div className="card text-center">
              <Bus className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fleet Management</h3>
              <p className="text-gray-600">
                Complete fleet tracking and maintenance management system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make School Transport Safer?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of schools and parents who trust ShuttleMate for safe, 
            reliable school transportation.
          </p>
          <SignedOut>
            <Link to="/login" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
              Start Free Trial
            </Link>
          </SignedOut>
          <SignedIn>
            <Link to="/parent-dashboard" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
              Access Dashboard
            </Link>
          </SignedIn>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home