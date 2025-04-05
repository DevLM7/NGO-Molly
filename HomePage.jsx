import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// Import actual images
import danceWorkshopImage from '../img/top image.jpg';
import healthcareImage from '../img/health.jpg';
import environmentImage from '../img/cleanup.jpeg';
import educationImage from '../img/education.jpg';
import educationGroupImage from '../img/education1.jpeg';
import digitalEducationImage from '../img/DigitalEdu.png';


const HomePage = () => {
  const { user, loading } = useAuth();

  // Features section content
  const features = [
    {
      title: 'Smart Event Management',
      description: 'Create and manage volunteer events with intelligent scheduling and resource allocation',
      icon: 'fas fa-calendar-alt',
      color: 'bg-blue-500'
    },
    {
      title: 'AI-Powered Matching',
      description: 'Connect volunteers with the perfect opportunities using our intelligent recommendation system',
      icon: 'fas fa-brain',
      color: 'bg-green-500'
    },
    {
      title: 'Facial Recognition Attendance',
      description: 'Simplify volunteer check-in with our state-of-the-art facial recognition system',
      icon: 'fas fa-camera',
      color: 'bg-orange-500'
    },
    {
      title: 'Social Community',
      description: 'Build connections, share experiences, and grow together in our interactive volunteer ecosystem',
      icon: 'fas fa-users',
      color: 'bg-purple-500'
    }
  ];

  // Statistics 
  const stats = [
    { value: '250+', label: 'NGOs Registered', icon: 'fas fa-building' },
    { value: '5,000+', label: 'Active Volunteers', icon: 'fas fa-hands-helping' },
    { value: '750+', label: 'Events Completed', icon: 'fas fa-calendar-check' },
    { value: '25,000+', label: 'Volunteer Hours', icon: 'fas fa-clock' }
  ];

  // Volunteer opportunities
  const opportunities = [
    {
      title: 'Healthcare Support',
      image: healthcareImage, // Using actual image
      description: 'Help provide healthcare services to communities in need',
      progress: 68
    },
    {
      title: 'Environmental Cleanup',
      image: environmentImage, // Using actual image
      description: 'Join efforts to clean and protect our natural environment',
      progress: 45
    },
    {
      title: 'Education Support',
      image: educationImage, // Using actual image
      description: 'Help provide quality education to underprivileged children',
      progress: 82
    }
  ];

  

  return (
    <div className="min-h-screen">
      {/* Hero Carousel Section */}
      <div className="relative overflow-hidden">
        <div className="carousel">
          <div className="carousel-item active">
            <div className="relative w-full h-screen min-h-[600px]">
              <img 
                className="absolute inset-0 w-full h-full object-cover" 
                src={danceWorkshopImage} // Using actual image
                alt="Volunteers making a difference" 
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(30, 58, 138, 0.8), rgba(118, 161, 226, 0.6), rgba(30, 58, 138, 0.8))' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="container mx-auto px-4 text-center">
                  <motion.h1 
                    className="text-5xl md:text-6xl font-bold text-white mb-6"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    Connect, Serve, Make An Impact
                  </motion.h1>
                  <motion.p 
                    className="text-xl text-white mb-8 max-w-3xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    Join our platform connecting NGOs and volunteers through smart automation, 
                    social interaction, and AI-powered event recommendations.
                  </motion.p>
                  <motion.div 
                    className="flex flex-wrap justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    {loading ? (
                      <div className="px-8 py-3 rounded-full bg-gray-300 animate-pulse">
                        <div className="h-6 w-32 bg-gray-400 rounded"></div>
                      </div>
                    ) : user ? (
                      <>
                        <Link to="/dashboard" className="btn-primary py-3 px-8 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                          Go to Dashboard
                          <i className="fas fa-arrow-right ml-2"></i>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link 
                          to="/register" 
                          className="btn-primary py-3 px-8 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          Get Started
                          <i className="fas fa-arrow-right ml-2"></i>
                        </Link>
                        <Link to="/login" className="py-3 px-8 rounded-full font-semibold bg-white text-blue-600 hover:bg-gray-100 transition-colors">
                          Log In
                        </Link>
                      </>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Images */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block rounded-full bg-blue-100 text-blue-600 px-4 py-1 text-sm font-semibold mb-4">
              OUR PLATFORM FEATURES
            </div>
            <h2 className="text-3xl font-bold mb-4">Intelligent Volunteer Management</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our platform uses cutting-edge technology to connect NGOs with volunteers, 
              streamline event management, and maximize social impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img src={educationGroupImage} alt="Education volunteers" className="w-full h-[350px] object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Empowering Education</h3>
              <p className="text-gray-600 mb-6">
                Our platform connects educators and volunteers with students who need support. 
                Whether it's tutoring, mentoring, or educational workshops, we make it easy to 
                make a difference in children's lives.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="bg-blue-500 p-2 rounded-full text-white mr-3">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">Smart Matching</h4>
                    <p className="text-sm text-gray-500">Matches volunteers to opportunities based on skills</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-500 p-2 rounded-full text-white mr-3">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">Progress Tracking</h4>
                    <p className="text-sm text-gray-500">Monitors student improvements and outcomes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center text-white mb-6`}>
                  <i className={`${feature.icon} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div> 
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16" style={{ background: 'linear-gradient(to right, #1E3A8A, #76A1E2, #1E3A8A)' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="inline-flex w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-4">
                  <i className={`${stat.icon} text-2xl text-white`}></i>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                <p className="text-white/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer Opportunities Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block rounded-full bg-blue-100 text-blue-600 px-4 py-1 text-sm font-semibold mb-4">
              VOLUNTEER OPPORTUNITIES
            </div>
            <h2 className="text-3xl font-bold mb-4">Make a Difference Today</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Browse through our featured volunteering opportunities and find the perfect cause to support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {opportunities.map((opportunity, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative">
                  <img src={opportunity.image} alt={opportunity.title} className="w-full h-48 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-white text-xl font-semibold">{opportunity.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{opportunity.description}</p>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-semibold">{opportunity.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${opportunity.progress}%` }}
                    ></div>
                  </div>
                  <Link 
                    to={user ? "/events" : "/register"} 
                    className="mt-6 inline-block py-2 px-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                  >
                    {loading ? (
                      <div className="h-4 w-20 bg-white/50 rounded animate-pulse"></div>
                    ) : user ? "View Details" : "Get Started as Volunteer"}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {loading ? (
            <div className="text-center mt-10">
              <div className="inline-block py-3 px-8 rounded-full bg-gray-200 animate-pulse">
                <div className="h-6 w-40 bg-gray-300 rounded"></div>
              </div>
            </div>
          ) : user ? (
            <div className="text-center mt-10">
              <Link 
                to="/events" 
                className="inline-block py-3 px-8 rounded-full font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Browse All Opportunities
                <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {/* Digital Learning Section with Image */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-block rounded-full bg-blue-100 text-blue-600 px-4 py-1 text-sm font-semibold mb-4">
                DIGITAL EDUCATION
              </div>
              <h2 className="text-3xl font-bold mb-4">Bridging the Digital Divide</h2>
              <p className="text-gray-600 mb-6">
                Our volunteers help children develop digital literacy skills essential for success in today's world. 
                Through mentorship and guided learning, we're empowering the next generation with technology skills.
              </p>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-full text-white mr-3">
                    <i className="fas fa-laptop"></i>
                  </div>
                  <span className="text-gray-700">Computer literacy programs for all ages</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-full text-white mr-3">
                    <i className="fas fa-chalkboard-teacher"></i>
                  </div>
                  <span className="text-gray-700">Expert volunteer teachers and mentors</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-full text-white mr-3">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <span className="text-gray-700">Measurable progress tracking</span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src={digitalEducationImage}
                alt="Children learning digital skills" 
                className="rounded-lg shadow-lg w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to Make a Difference?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join our community of NGOs and volunteers and start making an impact today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {loading ? (
                <div className="px-8 py-3 rounded-full bg-gray-700 animate-pulse">
                  <div className="h-6 w-32 bg-gray-600 rounded"></div>
                </div>
              ) : user ? (
                <Link 
                  to="/dashboard" 
                  className="py-3 px-8 rounded-full font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                  <i className="fas fa-arrow-right ml-2"></i>
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="py-3 px-8 rounded-full font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                    <i className="fas fa-arrow-right ml-2"></i>
                  </Link>
                  <Link 
                    to="/login" 
                    className="py-3 px-8 rounded-full font-semibold bg-white text-blue-900 hover:bg-gray-100 transition-colors"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
