import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/authContext';

export default function HostHome(){
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-6">Please login to access host dashboard.</p>
          <button
            onClick={() => navigate('/login?type=host')}
            className="bg-teal-600 text-white px-8 py-3 rounded font-semibold hover:bg-teal-700"
          >
            Login as Host
          </button>
        </div>
      </div>
    );
  }

  // If user is not a host, redirect to home
  if (!user.isHost) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-6">This page is for hosts only. Become a host to access this dashboard.</p>
          <button
            onClick={() => navigate('/home')}
            className="bg-teal-600 text-white px-8 py-3 rounded font-semibold hover:bg-teal-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const propertyTypes = [
    {
      name: 'Hotel Rooms',
      description: 'Comfort with services',
      icon: '🏨',
      color: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      name: 'Villas',
      description: 'Luxury private spaces',
      icon: '🏡',
      color: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      name: 'Resorts',
      description: 'All-in-one experiences',
      icon: '🏝️',
      color: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      name: 'Houses for Rent',
      description: 'Long-term living',
      icon: '🏘️',
      color: 'bg-teal-50',
      borderColor: 'border-teal-200'
    }
  ];

  const sampleProperties = [
    {
      type: 'Hotel Room',
      name: 'Luxury Ocean View Suite',
      location: 'Goa',
      price: '₹5,999/night',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
      earnings: 'Earn ₹1.8L/month'
    },
    {
      type: 'Villa',
      name: 'Private Hill Station Villa',
      location: 'Himachal Pradesh',
      price: '₹8,999/night',
      image: 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=400&h=300&fit=crop',
      earnings: 'Earn ₹2.7L/month'
    },
    {
      type: 'Resort',
      name: 'Beach Resort with Pool',
      location: 'Kerala',
      price: '₹7,499/night',
      image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e143?w=400&h=300&fit=crop',
      earnings: 'Earn ₹2.25L/month'
    },
    {
      type: 'House for Rent',
      name: 'Modern City Apartment',
      location: 'Bengaluru',
      price: '₹3,500/night',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
      earnings: 'Earn ₹1.05L/month'
    }
  ];

  const benefits = [
    { title: 'Easy Listing', desc: 'Simple form to add your property in minutes' },
    { title: 'Full Control', desc: 'Manage availability, pricing, and bookings' },
    { title: 'Secure Payments', desc: 'Direct payments via Razorpay to your account' },
    { title: 'Support', desc: '24/7 customer support for hosts' }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Host Your Properties with Confidence</h1>
          <p className="text-xl mb-8 opacity-90">Turn your spaces into profitable accommodations. Reach thousands of travelers today.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/host/edit-my-listing')}
              className="bg-white text-teal-700 px-8 py-3 rounded font-semibold hover:bg-gray-100"
            >
              View My Listings
            </button>
            <button
              onClick={() => navigate('/host/list-property')}
              className="border-2 border-white text-white px-8 py-3 rounded font-semibold hover:bg-teal-700"
            >
              Add Property
            </button>
          </div>
        </div>
      </div>

      {/* Property Types Showcase */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What You Can Host</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {propertyTypes.map((type) => (
            <div
              key={type.name}
              className={`${type.color} border-2 ${type.borderColor} rounded-lg p-6 text-center hover:shadow-lg transition cursor-pointer`}
            >
              <div className="text-5xl mb-4">{type.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{type.name}</h3>
              <p className="text-gray-600">{type.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Properties - Advertisement */}
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Properties Like These Are Earning Big</h2>
          <p className="text-gray-600 text-center mb-12 text-lg">Real hosts, real earnings. See what you could make with Travel Trove</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleProperties.map((prop, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105 cursor-pointer">
                <div className="relative">
                  <img src={prop.image} alt={prop.name} className="w-full h-48 object-cover" />
                  <div className="absolute top-3 right-3 bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {prop.type}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{prop.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{prop.location}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-teal-600 font-bold text-lg">{prop.price}</span>
                  </div>
                  <div className="bg-green-50 border-l-4 border-green-600 p-3 rounded mb-4">
                    <p className="text-green-700 font-semibold text-sm">{prop.earnings}</p>
                  </div>
                  <button
                    onClick={() => alert(`Property: ${prop.name}\n\nLocation: ${prop.location}\nType: ${prop.type}\nPrice: ${prop.price}\n${prop.earnings}\n\nThis is a sample property showing earning potential.`)}
                    className="w-full bg-teal-600 text-white py-2 rounded font-semibold hover:bg-teal-700 transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4 text-lg">Start listing your property today and join thousands of successful hosts!</p>
            <button
              onClick={() => navigate('/host/list-property')}
              className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition inline-block"
            >
              Start Listing Now
            </button>
          </div>
        </div>
      </div>

      {/* Why Host Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Host with Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-lg p-6 shadow">
                <h3 className="text-lg font-bold text-teal-600 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-teal-600 mb-2">10,000+</div>
            <p className="text-gray-600">Active Properties</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-teal-600 mb-2">50,000+</div>
            <p className="text-gray-600">Happy Travelers</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-teal-600 mb-2">₹100+ Cr</div>
            <p className="text-gray-600">Host Earnings</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-teal-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Hosting?</h2>
          <p className="text-lg mb-8 opacity-90">Join thousands of successful hosts earning with Travel Trove</p>
          <button
            onClick={() => navigate('/host/list-property')}
            className="bg-white text-teal-700 px-8 py-3 rounded font-semibold text-lg hover:bg-gray-100"
          >
            List Your First Property Now
          </button>
        </div>
      </div>
    </div>
  );
}
