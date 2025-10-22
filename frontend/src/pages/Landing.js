import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/authContext';
import Img1 from '../assets/LandingPageImg1.jpg';
import Img2 from '../assets/LandingPageImg2.jpg';
import Img3 from '../assets/LandingPageImg3.jpg';
import Img4 from '../assets/LandingPageImg4.jpg';
import Img5 from '../assets/LandingPageImg5.jpg';

export default function Landing(){
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [priceRange, setPriceRange] = useState('$50-$300');
  return (
    <div className="min-h-screen bg-teal-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center" style={{backgroundImage: `url(${Img5})`}}>
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative max-w-6xl mx-auto px-6 h-full flex flex-col justify-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Find Your Perfect Stay<br/>Hotels, Villas, Resorts<br/>& More</h1>
          <div className="flex gap-4 mt-6">
            <button onClick={() => navigate('/home')} className="bg-teal-600 text-white px-8 py-3 rounded font-semibold hover:bg-teal-700">Explore</button>
            <button onClick={() => { if (!user) navigate('/register?type=host'); else navigate('/host/list-property'); }} className="bg-white text-teal-600 px-8 py-3 rounded font-semibold hover:bg-gray-100">Host Property</button>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <p className="text-teal-600 text-sm font-semibold">THE EXPERIENCE</p>
            <h2 className="text-3xl font-bold text-gray-900">Why Choose US?</h2>
            <p className="text-gray-600 leading-relaxed">Discover why travelers and hosts choose Travel Trove for authentic stays and earning opportunities. We provide curated experiences and secure transactions.</p>
            <button onClick={() => navigate('/home')} className="bg-teal-600 text-white px-6 py-2 rounded font-semibold">Explore More</button>
          </div>
          <img src={Img2} alt="Why Choose Us" className="rounded-lg shadow-lg h-96 object-cover" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          <div><p className="text-3xl font-bold text-teal-600">20+</p><p className="text-gray-600">Destinations</p></div>
          <div><p className="text-3xl font-bold text-teal-600">1.5k+</p><p className="text-gray-600">Properties</p></div>
          <div><p className="text-3xl font-bold text-teal-600">750+</p><p className="text-gray-600">Happy Guests</p></div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-teal-600 text-sm font-semibold">OUR SERVICES</p>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">We Provide Top Destinations for you</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg overflow-hidden shadow hover:shadow-lg transition h-64">
            <img src={Img3} alt="Destination 1" className="w-full h-full object-cover" />
          </div>
          <div className="rounded-lg overflow-hidden shadow hover:shadow-lg transition h-64">
            <img src={Img4} alt="Destination 2" className="w-full h-full object-cover" />
          </div>
          <div className="rounded-lg overflow-hidden shadow hover:shadow-lg transition h-64">
            <img src={Img1} alt="Destination 3" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-teal-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-teal-600 text-sm font-semibold">TESTIMONIALS</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">What our Clients have to say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow flex gap-4">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-gray-900">Amazing Experience</p>
                <p className="text-gray-600 text-sm">★★★★★</p>
                <p className="text-gray-600 mt-2">The best stay I've ever had. Highly recommend Travel Trove!</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow flex gap-4">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-gray-900">Great Service</p>
                <p className="text-gray-600 text-sm">★★★★★</p>
                <p className="text-gray-600 mt-2">Customer support was excellent and the booking was seamless.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscribe to Get the latest News about Us</h2>
        <div className="flex gap-3 justify-center max-w-md mx-auto">
          <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-2 border border-gray-300 rounded" />
          <button className="bg-teal-600 text-white px-6 py-2 rounded font-semibold">Subscribe</button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-4 gap-8 text-sm">
          <div><h3 className="font-bold text-white mb-3">Company</h3><p>About</p><p>Blog</p></div>
          <div><h3 className="font-bold text-white mb-3">Support</h3><p>FAQ</p><p>Contact</p></div>
          <div><h3 className="font-bold text-white mb-3">Legal</h3><p>Privacy</p><p>Terms</p></div>
          <div><h3 className="font-bold text-white mb-3">Social</h3><p>Facebook</p><p>Twitter</p></div>
        </div>
      </footer>
    </div>
  );
}
