import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiHeart, FiAward, FiGlobe } from 'react-icons/fi';

const About = () => {
  const features = [
    {
      title: 'Connect with NGOs',
      description: 'Find and connect with NGOs that align with your interests and values.',
      icon: <FiUsers className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Make a Difference',
      description: 'Join a community of volunteers dedicated to creating positive change.',
      icon: <FiHeart className="w-6 h-6" />,
      color: 'bg-red-500'
    },
    {
      title: 'Track Impact',
      description: 'Keep track of your volunteer hours and contributions.',
      icon: <FiAward className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Global Community',
      description: 'Join a global network of volunteers and NGOs making a difference.',
      icon: <FiGlobe className="w-6 h-6" />,
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-blue-600">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
              About NGO Connect
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              We're on a mission to connect volunteers with NGOs and create positive change in communities around the world.
            </p>
          </div>
        </div>
      </div>

      {/* Mission section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Mission
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              NGO Connect is a platform that brings together volunteers and NGOs to create meaningful impact in communities. We believe that by connecting people with organizations that share their values, we can create positive change on a global scale.
            </p>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What We Offer
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Our platform provides tools and features to help volunteers and NGOs connect and collaborate effectively.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="relative">
                  <div className={`absolute inset-0 flex items-center justify-center h-12 w-12 rounded-md ${feature.color} text-white`}>
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
                to="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 