import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  const features = [
    {
      title: 'Event Management',
      description: 'Create and manage volunteer events with ease',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Volunteer Tracking',
      description: 'Track volunteer hours and contributions',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Impact Measurement',
      description: 'Measure and visualize your social impact',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const testimonials = [
    {
      quote: "This platform has revolutionized how we manage our volunteer programs.",
      author: "Sarah Johnson",
      role: "NGO Director",
      image: "https://source.unsplash.com/200x200/?portrait,woman",
    },
    {
      quote: "I've never felt more connected to my community. Finding and joining events is seamless.",
      author: "Michael Chen",
      role: "Volunteer",
      image: "https://source.unsplash.com/200x200/?portrait,man",
    },
    {
      quote: "The impact tracking features help us show our donors the real difference we're making.",
      author: "Emily Rodriguez",
      role: "Program Manager",
      image: "https://source.unsplash.com/200x200/?portrait,person",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-indigo-900">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://source.unsplash.com/1600x900/?volunteer,community"
            alt="Volunteers working together"
          />
          <div className="absolute inset-0 bg-indigo-900 opacity-75"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Make a Difference Today
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
            Join our community of changemakers. Whether you're an NGO looking to create impact
            or a volunteer ready to contribute, we've got you covered.
          </p>
          <div className="mt-10 flex space-x-4">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
                >
                  Get Started
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Learn More
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to create impact
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Our platform provides all the tools necessary to manage volunteers and track impact effectively.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div>
                  <div className="inline-flex p-3 ring-4 ring-white bg-indigo-50 rounded-lg text-indigo-700">
                    {feature.icon}
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Trusted by NGOs and Volunteers
          </h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="bg-white rounded-lg shadow-lg p-8 transform hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center mb-6">
                  <img
                    className="h-12 w-12 rounded-full"
                    src={testimonial.image}
                    alt={testimonial.author}
                  />
                  <div className="ml-4">
                    <div className="text-lg font-medium text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-indigo-600">{testimonial.role}</div>
                  </div>
                </div>
                <blockquote className="text-gray-600 italic">
                  "{testimonial.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to make an impact?</span>
            <span className="block text-indigo-200">Join our platform today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
