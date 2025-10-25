import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/authContext';

export default function ListProperty(){
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name:'', type:'Hotel Room', state:'', city:'', address:'', gpsUrl:'', 
    openingTime:'', closingTime:'', pricePerDay:'', rentalType:'Rent', 
    monthlyPrice:'', leaseTimeLimit:'', advanceAmount:'', leasePrice:'', 
    maxGuests:1, bedrooms:'1 BHK', facilities:[], available:true, customCity:''
  });
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFullEdit, setIsFullEdit] = useState(false);
  const [razorpayDetails, setRazorpayDetails] = useState({
    razorpayPaymentId: '',
    razorpayAccountId: ''
  });

  const facilityOptions = ['AC', 'Non-AC', 'Swimming Pool', 'WiFi', 'Parking', 'Restaurant', 'Spa', 'Gym'];
  const stateOptions = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Others'];
  const cityMap = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Tirupati', 'Kakinada'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Changlang'],
    'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Nagaon'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
    'Chhattisgarh': ['Raipur', 'Bilaspur', 'Durg', 'Rajnandgaon'],
    'Goa': ['Panaji', 'Margao', 'Vasco', 'Mapusa'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
    'Haryana': ['Faridabad', 'Gurgaon', 'Hisar', 'Rohtak'],
    'Himachal Pradesh': ['Shimla', 'Solan', 'Mandi', 'Dharamshala'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Giridih'],
    'Karnataka': ['Bangalore', 'Mysore', 'Coorg', 'Mangalore', 'Belgaum'],
    'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kottayam', 'Calicut', 'Thrissur'],
    'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
    'Manipur': ['Imphal', 'Bishnupur', 'Thoubal'],
    'Meghalaya': ['Shillong', 'Tura', 'Jowai'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Saiha'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur'],
    'Punjab': ['Chandigarh', 'Amritsar', 'Ludhiana', 'Jalandhar'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer', 'Kota'],
    'Sikkim': ['Gangtok', 'Pelling', 'Yuksom'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Ooty', 'Madurai', 'Salem'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Vijayawada'],
    'Tripura': ['Agartala', 'Udaipur', 'Ambassa'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Ghaziabad'],
    'Uttarakhand': ['Dehradun', 'Nainital', 'Mussoorie', 'Rishikesh'],
    'West Bengal': ['Kolkata', 'Darjeeling', 'Siliguri', 'Asansol']
  };

  const handleFile = (e) => {
    const newImages = Array.from(e.target.files);
    setImages([...images, ...newImages]);
  };

  const removeImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx)); Nanparna
  };

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (!user) {
      const next = editId ? `host/list-property?edit=${editId}` : 'host/list-property';
      navigate('/login?next=' + encodeURIComponent(next));
      return;
    }
    if (editId) {
      const params = new URLSearchParams(location.search);
      const isFull = params.get('full') === 'true';
      setIsFullEdit(isFull);
      
      const load = async () => {
        try {
          const res = await api.get('/properties/' + editId);
          const p = res.data.property;
          setForm({
            name: p.name || '', type: p.type || 'Hotel Room', state: p.state || '', city: p.city || '', 
            address: p.address || '', gpsUrl: p.gpsUrl || '', openingTime: p.openingTime || '', 
            closingTime: p.closingTime || '', pricePerDay: p.pricePerDay || '', rentalType: p.rentalType || 'Rent', 
            monthlyPrice: p.monthlyPrice || '', leaseTimeLimit: p.leaseTimeLimit || '', 
            advanceAmount: p.advanceAmount || '', leasePrice: p.leasePrice || '', 
            maxGuests: p.maxGuests || 1, bedrooms: p.bedrooms || '1 BHK', 
            facilities: p.facilities || [], available: p.available !== false, customCity: ''
          });
          // Set Razorpay details if in full edit mode
          if (isFull) {
            setRazorpayDetails({
              razorpayPaymentId: p.razorpayPaymentId || '',
              razorpayAccountId: p.razorpayAccountId || ''
            });
          }
        } catch (e) {
          console.error('Failed to load property', e.message);
        }
      };
      load();
    }
  }, [location.search, user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (images.length < 5) return setMessage('Please upload at least 5 images');
    
    if (!user) return setMessage('Please login to list a property');

    // Prepare final city value - use customCity if Others state is selected
    const finalCity = form.state === 'Others' ? form.customCity : form.city;
    if (!finalCity) return setMessage('Please select or enter a city');

    const data = new FormData();
    Object.entries(form).forEach(([k,v]) => {
      if (k === 'customCity') return; // Don't send customCity to backend
      if (k === 'city') {
        data.append(k, finalCity);
      } else {
        data.append(k, v);
      }
    });
    images.forEach(img => data.append('images', img));

    setLoading(true);
    try {
      const params = new URLSearchParams(location.search);
      const editId = params.get('edit');
      if (editId) {
        await api.put('/properties/' + editId, data, { headers: {'Content-Type':'multipart/form-data'} });
        setMessage('Listing updated successfully!');
      } else {
        await api.post('/properties', data, { headers: {'Content-Type':'multipart/form-data'} });
        setMessage('Listing submitted successfully!');
      }
      setTimeout(() => navigate('/host/edit-my-listing'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">List Your Property</h1>

        {message && (
          <div className={`mb-6 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={submit} className="bg-white rounded-lg shadow p-8 space-y-6">
          {/* Property Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Property Name *</label>
            <input 
              type="text" 
              required 
              placeholder="e.g., Oceanview Villa" 
              value={form.name} 
              onChange={e=>setForm({...form, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Accommodation Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Accommodation Type *</label>
            <select 
              required
              value={form.type} 
              onChange={e=>setForm({...form, type: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
            >
              <option>Hotel Room</option>
              <option>Resort</option>
              <option>Villa</option>
              <option>House for Rent</option>
            </select>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">State *</label>
              <select 
                required
                value={form.state} 
                onChange={e=>setForm({...form, state: e.target.value, city: '', customCity: ''})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
              >
                <option value="">Select State</option>
                {stateOptions.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">City *</label>
              {form.state === 'Others' ? (
                <input 
                  type="text"
                  required
                  placeholder="Enter your city name" 
                  value={form.customCity} 
                  onChange={e=>setForm({...form, customCity: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
                />
              ) : (
                <select 
                  required
                  value={form.city} 
                  onChange={e=>setForm({...form, city: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
                >
                  <option value="">Select City</option>
                  {form.state && cityMap[form.state]?.map(c => <option key={c}>{c}</option>)}
                  {form.state && cityMap[form.state] && <option value="">Others</option>}
                </select>
              )}
            </div>
          </div>

          {/* Address & GPS */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Exact Location *</label>
            <textarea 
              required
              placeholder="Detailed address" 
              value={form.address} 
              onChange={e=>setForm({...form, address: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">GPS URL</label>
            <input 
              type="url"
              placeholder="Google Maps link" 
              value={form.gpsUrl} 
              onChange={e=>setForm({...form, gpsUrl: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Opening Time</label>
              <input 
                type="time" 
                value={form.openingTime} 
                onChange={e=>setForm({...form, openingTime: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Closing Time</label>
              <input 
                type="time" 
                value={form.closingTime} 
                onChange={e=>setForm({...form, closingTime: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* Pricing */}
          {['Hotel Room','Resort','Villa'].includes(form.type) && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Price Per Day (₹) *</label>
              <input 
                type="number" 
                required
                placeholder="e.g., 5000" 
                value={form.pricePerDay} 
                onChange={e=>setForm({...form, pricePerDay: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
              />
            </div>
          )}

          {/* Facilities */}
          {['Hotel Room','Resort','Villa'].includes(form.type) && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Facilities</label>
              <div className="grid grid-cols-2 gap-2">
                {facilityOptions.map(f => (
                  <label key={f} className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={form.facilities.includes(f)}
                      onChange={e => {
                        if (e.target.checked) {
                          setForm({...form, facilities: [...form.facilities, f]});
                        } else {
                          setForm({...form, facilities: form.facilities.filter(x => x !== f)});
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{f}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* House for Rent - Rental Type */}
          {form.type === 'House for Rent' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Rental Type *</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      value="Rent" 
                      checked={form.rentalType === 'Rent'}
                      onChange={e=>setForm({...form, rentalType: e.target.value})}
                      className="mr-2"
                    />
                    Rent
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      value="Lease" 
                      checked={form.rentalType === 'Lease'}
                      onChange={e=>setForm({...form, rentalType: e.target.value})}
                      className="mr-2"
                    />
                    Lease
                  </label>
                </div>
              </div>

              {form.rentalType === 'Rent' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Monthly Price (₹) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g., 20000" 
                    value={form.monthlyPrice} 
                    onChange={e=>setForm({...form, monthlyPrice: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
                  />
                </div>
              )}

              {form.rentalType === 'Lease' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Lease Time Limit (months) *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g., 12" 
                      value={form.leaseTimeLimit} 
                      onChange={e=>setForm({...form, leaseTimeLimit: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Advance Amount (₹) *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g., 40000" 
                      value={form.advanceAmount} 
                      onChange={e=>setForm({...form, advanceAmount: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Lease Price (Total) (₹) *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g., 240000" 
                      value={form.leasePrice} 
                      onChange={e=>setForm({...form, leasePrice: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* Capacity & Rooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Max Guests *</label>
              <input 
                type="number" 
                required
                min="1" 
                value={form.maxGuests} 
                onChange={e=>setForm({...form, maxGuests: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Bedrooms *</label>
              <select 
                required
                value={form.bedrooms} 
                onChange={e=>setForm({...form, bedrooms: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
              >
                <option>1 BHK</option>
                <option>2 BHK</option>
                <option>3 BHK</option>
                <option>4+ BHK</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Upload Images (Minimum 5) *</label>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleFile}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">{images.length} image(s) selected</p>
                <div className="flex flex-wrap gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img 
                        src={URL.createObjectURL(img)} 
                        alt={`Preview ${idx}`} 
                        className="w-16 h-16 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Razorpay Details (Full Edit Only) */}
          {isFullEdit && (
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
              <div className="space-y-4">
                {razorpayDetails.razorpayPaymentId && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Razorpay Payment ID (Completed)</label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700">
                      {razorpayDetails.razorpayPaymentId}
                    </div>
                  </div>
                )}
                {razorpayDetails.razorpayAccountId && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Razorpay Account ID (Completed)</label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700">
                      {razorpayDetails.razorpayAccountId}
                    </div>
                  </div>
                )}
                {!razorpayDetails.razorpayPaymentId && !razorpayDetails.razorpayAccountId && (
                  <div className="text-gray-600 text-sm">
                    No payment details completed yet. Go to the Complete button to set up payment information.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit & Razorpay Setup */}
          <div className="space-y-3">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded font-semibold hover:bg-teal-700 disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Submit Listing'}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/host/onboard')}
              className="w-full bg-blue-500 text-white py-3 rounded font-semibold hover:bg-blue-600 text-sm"
            >
              + Add Razorpay (Optional)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
