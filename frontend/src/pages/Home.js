import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/authContext';
import newDelhiImg from '../assets/New Delhi, India.jpg';
import bangaloreImg from '../assets/banglore.jpg';
import mumbaiImg from '../assets/mumbai.jpg';
import chennaiImg from '../assets/chennai.jpg';
import hyderabadImg from '../assets/charminar-6925617_1280.jpg';
import gurgaonImg from '../assets/gurgaon.jpg';

export default function Home(){
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [guests, setGuests] = useState('1');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const locations = [
    {
      name: 'New Delhi',
      image: newDelhiImg,
      properties: 3607
    },
    {
      name: 'Bengaluru',
      image: bangaloreImg,
      properties: 3118
    },
    {
      name: 'Mumbai',
      image: mumbaiImg,
      properties: 1884
    },
    {
      name: 'Chennai',
      image: chennaiImg,
      properties: 1324
    },
    {
      name: 'Hyderabad',
      image: hyderabadImg,
      properties: 1815
    },
    {
      name: 'Gurgaon',
      image: gurgaonImg,
      properties: 1579
    }
  ];

  const getPropertyCountByCity = (city) => {
    return properties.filter(p => p.city?.toLowerCase() === city.toLowerCase()).length;
  };

  const handleCarouselNext = () => {
    setCarouselIndex((prev) => (prev + 1) % locations.length);
  };

  const handleCarouselPrev = () => {
    setCarouselIndex((prev) => (prev - 1 + locations.length) % locations.length);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/properties');
        setProperties(res.data.properties || []);
        setFilteredProperties(res.data.properties || []);
      } catch (e) {
        console.error('Failed to load properties', e.message);
      }
    };
    load();
  }, []);

  const handleFilter = () => {
    let filtered = properties;
    if (searchLocation) filtered = filtered.filter(p => p.city?.toLowerCase().includes(searchLocation.toLowerCase()));
    
    // Filter by price - check all price types
    if (minPrice) {
      filtered = filtered.filter(p => {
        const price = p.pricePerDay || p.monthlyPrice || p.leasePrice || 0;
        return price >= parseInt(minPrice);
      });
    }
    if (maxPrice) {
      filtered = filtered.filter(p => {
        const price = p.pricePerDay || p.monthlyPrice || p.leasePrice || 0;
        return price <= parseInt(maxPrice);
      });
    }
    
    if (guests) filtered = filtered.filter(p => p.maxGuests >= parseInt(guests));
    setFilteredProperties(filtered);
  };

  const handleLocationClick = (loc) => {
    setSelectedLocation(loc);
    let filtered = properties.filter(p => p.city?.toLowerCase() === loc.toLowerCase());
    setFilteredProperties(filtered);
  };

  const getPropertiesByType = (type) => {
    return filteredProperties.filter(p => p.type === type);
  };

  const PropertyCard = ({prop}) => (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      <img src={prop.images?.[0] || 'https://via.placeholder.com/300x200'} alt={prop.name} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{prop.name}</h3>
        <p className="text-sm text-gray-600">{prop.city}, {prop.state}</p>
        <p className="text-teal-600 font-bold mt-2">
          {prop.pricePerDay ? (
            <>₹{prop.pricePerDay}/day</>
          ) : prop.monthlyPrice ? (
            <>₹{prop.monthlyPrice}/month</>
          ) : prop.leasePrice ? (
            <>₹{prop.leasePrice} (Lease)</>
          ) : (
            <>Price on request</>
          )}
        </p>
        <button 
          onClick={() => navigate(`/property-details/${prop._id}`)}
          className="mt-3 w-full bg-teal-600 text-white py-2 rounded font-semibold hover:bg-teal-700 transition cursor-pointer"
        >
          View Details
        </button>
      </div>
    </div>
  );

  // HOST VIEW - Show host advertisement and earnings potential
  if (user && user.isHost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-20">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold mb-4">Host Your Properties with Confidence</h1>
            <p className="text-xl mb-8 opacity-90">Turn your spaces into profitable accommodations. Reach thousands of travelers today.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/host/edit-my-listing')}
                className="bg-white text-teal-700 px-8 py-3 rounded font-semibold hover:bg-gray-100 transition"
              >
                View My Listings
              </button>
              <button
                onClick={() => navigate('/host/list-property')}
                className="border-2 border-white text-white px-8 py-3 rounded font-semibold hover:bg-teal-700 transition"
              >
                Add Property
              </button>
            </div>
          </div>
        </div>

        {/* Sample Properties - Advertisement */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Properties Like These Are Earning Big</h2>
          <p className="text-gray-600 text-center mb-12 text-lg">Real hosts, real earnings. See what you could make with Travel Trove</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
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
            ].map((prop, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105">
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
                  <div className="bg-green-50 border-l-4 border-green-600 p-3 rounded">
                    <p className="text-green-700 font-semibold text-sm">{prop.earnings}</p>
                  </div>
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

        {/* Stats Section */}
        <div className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
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
        </div>
      </div>
    );
  }

  // CUSTOMER VIEW - Show property browsing (existing code)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero & Search Section */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Welcome to Travel Trove!</h1>
          <p className="text-lg opacity-90">Find Your Perfect Accommodation at Any Price, for Any Need, in Any Place.</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-6xl mx-auto px-6 py-8 -mt-6 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <input 
              type="text" 
              placeholder="Search city or area..." 
              value={searchLocation} 
              onChange={e => setSearchLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600" 
            />
            <input 
              type="number" 
              placeholder="Min Price" 
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600" 
            />
            <input 
              type="number" 
              placeholder="Max Price" 
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600" 
            />
            <select 
              value={guests}
              onChange={e => setGuests(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="4">4 Guests</option>
              <option value="8">8+ Guests</option>
            </select>
            <button 
              onClick={handleFilter}
              className="bg-teal-600 text-white px-6 py-2 rounded font-semibold hover:bg-teal-700"
            >
              Search
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Facilities:</span>
            {['AC', 'Pool', 'WiFi', 'Parking'].map(f => (
              <button key={f} className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-teal-50">{f}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Explore India - Carousel Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore India</h2>
        <p className="text-gray-600 mb-8">These popular destinations have a lot to offer</p>
        
        {/* Carousel Container */}
        <div className="relative">
          {/* Location Cards Carousel */}
          <div className="flex gap-6 overflow-hidden">
            {/* Previous Button */}
            <button
              onClick={handleCarouselPrev}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-white border-2 border-teal-600 hover:bg-teal-50 rounded-full w-12 h-12 flex items-center justify-center transition -ml-6"
            >
              <span className="text-2xl text-teal-600">❮</span>
            </button>

            {/* Next Button */}
            <button
              onClick={handleCarouselNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-white border-2 border-teal-600 hover:bg-teal-50 rounded-full w-12 h-12 flex items-center justify-center transition -mr-6"
            >
              <span className="text-2xl text-teal-600">❯</span>
            </button>

            {/* Carousel Track */}
            <div className="flex gap-6 transition-transform duration-300" style={{
              transform: `translateX(-${(carouselIndex) * (100 / 3)}%)`,
              width: `${(locations.length / 3) * 100}%`
            }}>
              {locations.map((location) => {
                const propertyCount = getPropertyCountByCity(location.name);
                return (
                  <button
                    key={location.name}
                    onClick={() => {
                      handleLocationClick(location.name);
                      window.scrollTo({ top: 500, behavior: 'smooth' });
                    }}
                    className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 flex-shrink-0 w-1/3"
                  >
                    <img 
                      src={location.image} 
                      alt={location.name} 
                      className="w-full h-80 object-cover group-hover:brightness-75 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{location.name}</h3>
                      <p className="text-gray-200 text-sm">{propertyCount > 0 ? propertyCount : location.properties} properties</p>
                    </div>
                    {selectedLocation === location.name && (
                      <div className="absolute inset-0 border-4 border-teal-400 rounded-xl"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {locations.map((_, index) => (
              <button
                key={index}
                onClick={() => setCarouselIndex(index)}
                className={`h-2 rounded-full transition ${
                  index === carouselIndex ? 'bg-teal-600 w-8' : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {selectedLocation && (
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Properties in {selectedLocation}</h3>
            <p className="text-gray-600 mb-8">Showing all available properties</p>

            {/* Hotel Rooms */}
            {getPropertiesByType('Hotel Room').length > 0 && (
              <div className="mb-12">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Hotel Rooms</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPropertiesByType('Hotel Room').map(p => (
                    <PropertyCard key={p._id} prop={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Villas */}
            {getPropertiesByType('Villa').length > 0 && (
              <div className="mb-12">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Villas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPropertiesByType('Villa').map(p => (
                    <PropertyCard key={p._id} prop={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Resorts */}
            {getPropertiesByType('Resort').length > 0 && (
              <div className="mb-12">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Resorts</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPropertiesByType('Resort').map(p => (
                    <PropertyCard key={p._id} prop={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Houses for Rent */}
            {getPropertiesByType('House for Rent').length > 0 && (
              <div className="mb-12">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Houses for Rent</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPropertiesByType('House for Rent').map(p => (
                    <PropertyCard key={p._id} prop={p} />
                  ))}
                </div>
              </div>
            )}

            {filteredProperties.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No properties found in {selectedLocation}.</p>
              </div>
            )}
          </div>
        )}

        {!selectedLocation && (
          <>
            {/* Hotel Rooms */}
            {getPropertiesByType('Hotel Room').length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Hotel Rooms</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {getPropertiesByType('Hotel Room').map(p => (
                    <PropertyCard key={p._id} prop={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Villas */}
            {getPropertiesByType('Villa').length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Villas</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {getPropertiesByType('Villa').map(p => (
                    <PropertyCard key={p._id} prop={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Resorts */}
            {getPropertiesByType('Resort').length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Resorts</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {getPropertiesByType('Resort').map(p => (
                    <PropertyCard key={p._id} prop={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Houses for Rent */}
            {getPropertiesByType('House for Rent').length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Houses for Rent</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {getPropertiesByType('House for Rent').map(p => (
                    <PropertyCard key={p._id} prop={p} />
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {filteredProperties.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No properties found. Try adjusting your filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
