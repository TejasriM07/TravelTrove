import React, { useContext, useState } from 'react';
import { AuthContext } from '../utils/authContext';
import api from '../utils/api';

export default function About(){
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReview = async () => {
    if (!user) {
      alert('Please log in to submit a review');
      return;
    }
    if (rating === 0 || review.trim() === '') {
      alert('Please provide both rating and review');
      return;
    }
    try {
      await api.post('/reviews', { rating, comment: review });
      setSubmitted(true);
      setRating(0);
      setReview('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      alert('Failed to submit review');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* About Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Travel Trove</h1>
          
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Travel Trove is a comprehensive platform designed to connect travelers with unique accommodations and help property owners monetize their assets. Whether you're looking for a cozy hotel room, a luxurious villa, a peaceful resort, or a home for rent, we've got you covered.
            </p>
            <p>
              Our mission is to provide authentic, curated experiences while ensuring secure transactions and reliable service for both guests and hosts. We believe in transparency, trust, and community.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-6 text-center pt-8 border-t">
            <div>
              <p className="text-3xl font-bold text-teal-600">20+</p>
              <p className="text-gray-600">Destinations</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-teal-600">1.5k+</p>
              <p className="text-gray-600">Properties</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-teal-600">750+</p>
              <p className="text-gray-600">Happy Guests</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="text-gray-900 font-semibold">support@travelthrove.com</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Phone</p>
              <p className="text-gray-900 font-semibold">+91 (555) 123-4567</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Address</p>
              <p className="text-gray-900 font-semibold">123 Travel Lane, Mumbai, India</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews & Ratings</h2>
          
          {user ? (
            <div className="space-y-4">
              <div>
                <label className="text-gray-600 text-sm">Rating</label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl transition ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-600 text-sm">Your Review</label>
                <textarea
                  value={review}
                  onChange={e => setReview(e.target.value)}
                  placeholder="Share your experience with Travel Trove..."
                  rows="5"
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
                />
              </div>

              <button
                onClick={handleSubmitReview}
                className="w-full bg-teal-600 text-white py-2 rounded font-semibold hover:bg-teal-700"
              >
                Submit Review
              </button>

              {submitted && (
                <div className="bg-green-100 text-green-800 p-3 rounded">
                  ✓ Thank you! Your review has been submitted.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 p-6 rounded text-center">
              <p className="text-gray-600 mb-4">Please log in to submit a review.</p>
              <a href="/login" className="text-teal-600 font-semibold hover:underline">Log In</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
