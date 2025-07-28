import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ShuttleMate</h3>
            <p className="text-gray-300">
              Safe and reliable school transport management system for modern schools.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Contact Info</h4>
            <p className="text-gray-300">
              Email: support@shuttlemate.com<br />
              Phone: +1 (555) 123-4567
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 ShuttleMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer