import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/authContext';
import api from '../utils/api';
import deerAvatar from '../assets/deer.png';
import dogAvatar from '../assets/dog.png';
import owlAvatar from '../assets/owl.png';
import wolfAvatar from '../assets/wolf.png';
import jaguarAvatar from '../assets/jaguar.png';
import pandaAvatar from '../assets/panda-bear.png';
import turtleAvatar from '../assets/turtle.png';
import ganeshAvatar from '../assets/ganesha.png';

export default function Profile(){
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'Deer');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || 'Deer'
  });

  const avatarOptions = [
    { name: 'Deer', image: deerAvatar },
    { name: 'Dog', image: dogAvatar },
    { name: 'Owl', image: owlAvatar },
    { name: 'Wolf', image: wolfAvatar },
    { name: 'Jaguar', image: jaguarAvatar },
    { name: 'Panda', image: pandaAvatar },
    { name: 'Turtle', image: turtleAvatar },
    { name: 'Ganesha', image: ganeshAvatar }
  ];

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setSelectedAvatar(user.avatar || 'Deer');
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || 'Deer'
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAvatar = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.patch('/auth/updateMe', { avatar: selectedAvatar });
      setUser(res.data.user);
      setFormData(prev => ({ ...prev, avatar: selectedAvatar }));
      setEditingAvatar(false);
      setSuccess('Avatar updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Failed to update avatar');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Name is required');
        return;
      }
      if (!formData.phone.trim()) {
        setError('Phone is required');
        return;
      }

      setLoading(true);
      setError('');
      const res = await api.patch('/auth/updateMe', {
        name: formData.name,
        phone: formData.phone
      });
      setUser(res.data.user);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update profile');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!passwordData.oldPassword.trim()) {
        setError('Old password is required');
        return;
      }
      if (!passwordData.newPassword.trim()) {
        setError('New password is required');
        return;
      }
      if (passwordData.newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }
      if (!/[0-9]/.test(passwordData.newPassword)) {
        setError('New password must contain at least one number');
        return;
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword)) {
        setError('New password must contain at least one special character');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      setLoading(true);
      setError('');
      await api.patch('/auth/updatePassword', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setChangePasswordMode(false);
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to change password');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      navigate('/');
    } catch (e) {
      setUser(null);
      navigate('/');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError('');
      await api.delete('/auth/deleteMe');
      setUser(null);
      navigate('/');
      setShowDeleteConfirm(false);
      setSuccess('Account deleted successfully');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete account');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarImage = (avatarName) => {
    const avatar = avatarOptions.find(a => a.name === avatarName);
    return avatar?.image || deerAvatar;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
          <p className="text-gray-600 mb-4">Please log in to manage your profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-teal-600 text-white py-2 rounded font-semibold hover:bg-teal-700 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-full mt-3 bg-gray-200 text-gray-900 py-2 rounded font-semibold hover:bg-gray-300 transition"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-teal-50 border-l-4 border-teal-600 rounded">
            <p className="text-teal-700 font-semibold">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Profile Header with Avatar */}
          <div className="text-center mb-12 pb-8 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>
            
            {/* Centered Avatar */}
            <div className="flex flex-col items-center gap-4">
              <img 
                src={getAvatarImage(selectedAvatar)} 
                alt="Profile"
                className="w-32 h-32 rounded-lg shadow-lg object-contain bg-teal-50"
              />
              <p className="text-xl font-semibold text-gray-900">{user.name}</p>
              {!editingAvatar && (
                <button
                  onClick={() => setEditingAvatar(true)}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition mt-2"
                >
                  Change Avatar
                </button>
              )}
            </div>

            {/* Edit Avatar Modal */}
            {editingAvatar && (
              <div className="mt-6 p-6 bg-teal-50 rounded-lg border border-teal-200">
                <p className="text-gray-700 font-semibold mb-4">Select your avatar:</p>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
                  {avatarOptions.map(avatar => (
                    <button
                      key={avatar.name}
                      onClick={() => setSelectedAvatar(avatar.name)}
                      title={avatar.name}
                      className={`p-3 rounded-lg border-2 flex items-center justify-center h-20 transition ${
                        selectedAvatar === avatar.name
                          ? 'bg-teal-100 border-teal-600 scale-105 ring-2 ring-teal-500'
                          : 'bg-white border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      <img src={avatar.image} alt={avatar.name} className="w-12 h-12 object-contain" />
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveAvatar}
                    disabled={loading}
                    className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-400 transition"
                  >
                    {loading ? 'Saving...' : 'Save Avatar'}
                  </button>
                  <button
                    onClick={() => setEditingAvatar(false)}
                    disabled={loading}
                    className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-400 disabled:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Account Information Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {!editMode ? (
              // View Mode
              <div className="space-y-5">
                <div className="flex justify-between items-start py-4 border-b border-gray-100">
                  <div>
                    <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Full Name</label>
                    <p className="text-gray-900 text-lg font-medium mt-1">{user.name}</p>
                  </div>
                </div>
                <div className="flex justify-between items-start py-4 border-b border-gray-100">
                  <div>
                    <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Email Address</label>
                    <p className="text-gray-900 text-lg font-medium mt-1">{user.email}</p>
                  </div>
                </div>
                <div className="flex justify-between items-start py-4 border-b border-gray-100">
                  <div>
                    <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Phone Number</label>
                    <p className="text-gray-900 text-lg font-medium mt-1">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex justify-between items-start py-4">
                  <div>
                    <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Account Type</label>
                    <p className="text-gray-900 text-lg font-medium mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        user.isHost 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.isHost ? '🏠 Host' : '👤 Guest'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-5">
                <div>
                  <label className="text-gray-700 font-semibold block mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="text-gray-700 font-semibold block mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-sm text-gray-500 mt-2">Email cannot be changed</p>
                </div>
                <div>
                  <label className="text-gray-700 font-semibold block mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-400 transition"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        avatar: user?.avatar || 'Deer'
                      });
                      setError('');
                    }}
                    disabled={loading}
                    className="flex-1 bg-gray-300 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-400 disabled:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/my-bookings')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition text-left"
              >
                <p className="font-semibold text-gray-900">📅 My Bookings</p>
                <p className="text-sm text-gray-600 mt-1">View your reservations</p>
              </button>
              {!user.isHost && (
                <button
                  onClick={() => navigate('/host/onboard')}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition text-left"
                >
                  <p className="font-semibold text-gray-900">🏠 Become a Host</p>
                  <p className="text-sm text-gray-600 mt-1">List your property</p>
                </button>
              )}
              {user.isHost && (
                <button
                  onClick={() => navigate('/host/edit-my-listing')}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition text-left"
                >
                  <p className="font-semibold text-gray-900">📝 My Listings</p>
                  <p className="text-sm text-gray-600 mt-1">Manage properties</p>
                </button>
              )}
              <button
                onClick={() => navigate('/about')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition text-left"
              >
                <p className="font-semibold text-gray-900">ℹ️ About Us</p>
                <p className="text-sm text-gray-600 mt-1">Learn more about Travel Trove</p>
              </button>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Security</h2>
              {!changePasswordMode && (
                <button
                  onClick={() => setChangePasswordMode(true)}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
                >
                  Change Password
                </button>
              )}
            </div>

            {!changePasswordMode ? (
              <div className="p-6 bg-teal-50 border border-teal-200 rounded-lg">
                <p className="text-gray-700">🔒 Keep your account secure by regularly changing your password.</p>
              </div>
            ) : (
              <div className="space-y-5 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div>
                  <label className="text-gray-700 font-semibold block mb-2">Current Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition"
                    placeholder="Enter your current password"
                  />
                </div>
                <div>
                  <label className="text-gray-700 font-semibold block mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition"
                    placeholder="Enter new password (6+ chars, 1+ number, 1+ special char)"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Password must have: 6+ characters, 1+ number, 1+ special character (!@#$%^&* etc)
                  </p>
                </div>
                <div>
                  <label className="text-gray-700 font-semibold block mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition"
                    placeholder="Confirm your new password"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-400 transition"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    onClick={() => {
                      setChangePasswordMode(false);
                      setPasswordData({
                        oldPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setError('');
                    }}
                    disabled={loading}
                    className="flex-1 bg-gray-300 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-400 disabled:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleLogout}
                className="p-6 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
              >
                <p className="font-semibold text-blue-900">🚪 Logout</p>
                <p className="text-sm text-blue-700 mt-2">Sign out from your account</p>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-6 border-2 border-red-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition text-left"
              >
                <p className="font-semibold text-red-900">⚠️ Delete Account</p>
                <p className="text-sm text-red-700 mt-2">Permanently delete your account and all data</p>
              </button>
            </div>
          </div>

          {/* Delete Account Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8">
                <div className="text-center mb-6">
                  <p className="text-3xl mb-2">⚠️</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Account?</h3>
                  <p className="text-gray-600 mb-4">
                    This action cannot be undone. All your data, bookings, and listings will be permanently deleted.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-700 font-semibold">
                      ⚠️ This will permanently erase your entire account including:
                    </p>
                    <ul className="text-sm text-red-600 mt-2 space-y-1">
                      <li>✗ All personal information</li>
                      <li>✗ All bookings and reservations</li>
                      <li>✗ All property listings (if host)</li>
                      <li>✗ All reviews and ratings</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                    className="flex-1 bg-gray-300 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-400 disabled:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition"
                  >
                    {loading ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
