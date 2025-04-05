import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiAward, FiHeart } from 'react-icons/fi';

const Home = () => {
  const features = [
    {
      title: 'Connect with NGOs',
      description: 'Find and connect with NGOs that align with your interests and values.',
      icon: <FiUsers className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Volunteer Events',
      description: 'Discover and participate in volunteer events that make a difference.',
      icon: <FiCalendar className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Track Impact',
      description: 'Keep track of your volunteer hours and contributions.',
      icon: <FiAward className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Make a Difference',
      description: 'Join a community of volunteers dedicated to creating positive change.',
      icon: <FiHeart className="w-6 h-6" />,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-blue-600">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
              Connect with NGOs and Make a Difference
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              Join our platform to connect with NGOs, participate in volunteer events, and track your impact in the community.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </Link>
              <Link
                to="/events"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose NGO Connect?
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Our platform makes it easy to connect with NGOs and make a difference in your community.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="relative">
                  <div className="absolute inset-0 flex items-center justify-center h-12 w-12 rounded-md bg-white text-blue-600">
                    {feature.icon}
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to make a difference?</span>
            <span className="block text-blue-200">Join our community today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 