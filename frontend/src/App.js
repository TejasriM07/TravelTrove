import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import MyBooking from './pages/MyBooking';
import Profile from './pages/Profile';
import PropertyDetails from './pages/PropertyDetails';
import HostHome from './pages/HostHome';
import OnboardHost from './pages/OnboardHost';
import ListProperty from './pages/ListProperty';
import EditMyListing from './pages/EditMyListing';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import api from './utils/api';
import { AuthContext } from './utils/authContext';

export default function App(){
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user || null);
      } catch (e) {
        setUser(null);
      }
    };
    load();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <div>
        <Navbar />
        <main style={{padding: '20px'}}>
          <Routes>
            <Route path='/' element={<Landing/>} />
            <Route path='/home' element={<Home/>} />
            <Route path='/my-bookings' element={<MyBooking/>} />
            <Route path='/profile' element={<Profile/>} />
            <Route path='/property-details/:id' element={<PropertyDetails/>} />
            <Route path='/about' element={<About/>} />
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>} />
            <Route path='/verify' element={<Verify/>} />
            <Route path='/host' element={<HostHome/>} />
            <Route path='/host/onboard' element={<OnboardHost/>} />
            <Route path='/host/list-property' element={<ListProperty/>} />
            <Route path='/host/edit-my-listing' element={<EditMyListing/>} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
}
