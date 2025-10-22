import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../utils/authContext';
import api from '../utils/api';
import favicon from '../assets/site_favicon.png';
import deerAvatar from '../assets/deer.png';
import dogAvatar from '../assets/dog.png';
import owlAvatar from '../assets/owl.png';
import wolfAvatar from '../assets/wolf.png';
import jaguarAvatar from '../assets/jaguar.png';
import pandaAvatar from '../assets/panda-bear.png';
import turtleAvatar from '../assets/turtle.png';
import ganeshAvatar from '../assets/ganesha.png';

export default function Navbar(){
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const getAvatarImage = (avatarName) => {
    const avatar = avatarOptions.find(a => a.name === avatarName);
    return avatar?.image || deerAvatar;
  };

  // Debug: Log user state changes
  React.useEffect(() => {
    console.log('Navbar - User updated:', user);
  }, [user]);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      navigate('/');
      setMobileMenuOpen(false);
    } catch (e) {
      setUser(null);
      navigate('/');
      setMobileMenuOpen(false);
    }
  };

  // Define three variants: guest, regular user, host
  const GuestNav = () => (
    <nav className="hidden md:flex items-center gap-6">
      <Link to="/home" className="text-gray-700 hover:text-teal-600 font-medium transition">Home</Link>
      <Link to={`/login?next=${encodeURIComponent('host')}`} className="text-gray-700 hover:text-teal-600 font-medium transition">Host Dashboard</Link>
      <Link to="/about" className="text-gray-700 hover:text-teal-600 font-medium transition">About</Link>
      <Link to="/login" className="bg-teal-600 text-white px-4 py-2 rounded font-medium hover:bg-teal-700 transition">Login</Link>
    </nav>
  );

  const GuestNavMobile = () => (
    <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
      <nav className="flex flex-col gap-0 p-4">
        <Link to="/home" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-teal-600 font-medium transition py-3 border-b border-gray-200">Home</Link>
        <Link to={`/login?next=${encodeURIComponent('host')}`} onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-teal-600 font-medium transition py-3 border-b border-gray-200">Host Dashboard</Link>
        <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-teal-600 font-medium transition py-3 border-b border-gray-200">About</Link>
        <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="bg-teal-600 text-white px-4 py-3 rounded font-medium hover:bg-teal-700 transition">Login</Link>
      </nav>
    </div>
  );

  const UserNav = () => (
    <nav className="hidden md:flex items-center gap-6">
      <Link to="/home" className="text-gray-700 hover:text-teal-600 font-medium transition">Home</Link>
      <Link to="/my-bookings" className="text-gray-700 hover:text-teal-600 font-medium transition">My Booking</Link>
      <Link to="/about" className="text-gray-700 hover:text-teal-600 font-medium transition">About</Link>
      <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition">
        <span className="text-gray-700 font-medium">{user?.name}</span>
        <img 
          src={getAvatarImage(user?.avatar || 'Deer')} 
          alt="Profile Avatar" 
          className="w-10 h-10 rounded-full object-cover border-2 border-teal-600"
        />
      </Link>
    </nav>
  );

  const UserNavMobile = () => (
    <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
      <nav className="flex flex-col gap-0 p-4">
        <Link to="/home" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-teal-600 font-medium transition py-3 border-b border-gray-200">Home</Link>
        <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-teal-600 font-medium transition py-3 border-b border-gray-200">My Booking</Link>
        <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-teal-600 font-medium transition py-3 border-b border-gray-200">About</Link>
        <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-teal-600 font-medium transition py-3">
          <span>{user?.name}</span>
          <img 
            src={getAvatarImage(user?.avatar || 'Deer')} 
            alt="Profile Avatar" 
            className="w-10 h-10 rounded-full object-cover border-2 border-teal-600"
          />
        </Link>
      </nav>
    </div>
  );

  const HostNav = () => (
    <nav className="hidden md:flex items-center gap-6">
      <Link to="/home" className="text-gray-700 hover:text-teal-600 font-medium transition">Browse Properties</Link>
      <Link to="/host" className="text-gray-700 hover:text-teal-600 font-medium transition">Host Dashboard</Link>
      <Link to="/host/list-property" className="text-gray-700 hover:text-teal-600 font-medium transition">List Property</Link>
      <Link to="/host/edit-my-listing" className="text-gray-700 hover:text-teal-600 font-medium transition">My Listings</Link>
      <Link to="/about" className="text-gray-700 hover:text-teal-600 font-medium transition">About</Link>
      <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition">
        <span className="text-teal-600 font-bold">{user?.name}</span>
        <img 
          src={getAvatarImage(user?.avatar || 'Deer')} 
          alt="Profile Avatar" 
          className="w-10 h-10 rounded-full object-cover border-2 border-teal-600"
        />
      </Link>
    </nav>
  );

  const HostNavMobile = () => (
    <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
      <nav className="flex flex-col gap-0 p-4">
        <Link to="/home" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-teal-600 font-medium transition py-3 border-b border-gray-200">Browse Properties</Link>
        <Link to="/host" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-teal-600 font-medium transition py-3 border-b border-gray-200">Host Dashboard</Link>
        <Link to="/host/list-property" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-teal-600 font-medium transition py-3 border-b border-gray-200">List Property</Link>
        <Link to="/host/edit-my-listing" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-teal-600 font-medium transition py-3 border-b border-gray-200">My Listings</Link>
        <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-teal-600 font-medium transition py-3 border-b border-gray-200">About</Link>
        <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-teal-600 font-medium transition py-3">
          <span>{user?.name}</span>
          <img 
            src={getAvatarImage(user?.avatar || 'Deer')} 
            alt="Profile Avatar" 
            className="w-10 h-10 rounded-full object-cover border-2 border-teal-600"
          />
        </Link>
      </nav>
    </div>
  );

  // If we're on the landing page, render minimal navbar: brand left, About right
  if (location.pathname === '/') {
    return (
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 flex justify-between items-center">
          <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
            <img src={favicon} alt="Travel Trove Logo" className="w-12 h-12 md:w-14 md:h-14" />
            <span className="text-2xl md:text-3xl font-bold text-teal-600 truncate">Travel Trove</span>
          </div>
          <nav className="hidden md:flex">
            <Link to="/about" className="text-gray-700 hover:text-teal-600 font-medium transition">About</Link>
          </nav>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 text-2xl hover:text-teal-600 transition"
          >
            ☰
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
            <nav className="flex flex-col gap-0 p-4">
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-teal-600 font-medium transition py-3">About</Link>
            </nav>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 relative">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition flex-shrink-0">
          <img src={favicon} alt="Travel Trove Logo" className="w-8 h-8" />
          <span className="text-lg md:text-2xl font-bold text-teal-600 truncate">Travel Trove</span>
        </div>
        
        {/* Hamburger menu for mobile */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-700 text-2xl hover:text-teal-600 transition flex-shrink-0"
        >
          ☰
        </button>

        {/* Desktop navigation */}
        {!user && <GuestNav />}
        {user && !user.isHost && <UserNav />}
        {user && user.isHost && <HostNav />}
      </div>

      {/* Mobile navigation menus */}
      {mobileMenuOpen && (
        <>
          {!user && <GuestNavMobile />}
          {user && !user.isHost && <UserNavMobile />}
          {user && user.isHost && <HostNavMobile />}
        </>
      )}
    </header>
  );
}
