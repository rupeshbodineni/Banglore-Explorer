import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Heart, MapPin, Star, Plus, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const { user, toggleFavorite } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('favorites');
  const [adminPlaces, setAdminPlaces] = useState([]);
  
  // Admin form state
  const [newPlace, setNewPlace] = useState({
    name: '',
    description: '',
    category: 'Hotel',
    lat: '',
    lng: ''
  });

  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'admin') {
      const fetchAdminPlaces = async () => {
        try {
          const { data } = await api.get('/places');
          setAdminPlaces(data);
        } catch (error) {
          console.error('Error fetching places:', error);
        }
      };
      fetchAdminPlaces();
    }
  }, [user, activeTab]);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newPlace.name,
        description: newPlace.description,
        category: newPlace.category,
        location: { lat: Number(newPlace.lat), lng: Number(newPlace.lng) },
        images: ['https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80']
      };
      
      const { data } = await api.post('/places', payload);
      setAdminPlaces([...adminPlaces, data]);
      setNewPlace({ name: '', description: '', category: 'Hotel', lat: '', lng: '' });
      alert('Place added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding place');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl text-primary-700 font-bold mb-4">
                {user.name.charAt(0)}
              </div>
              <h2 className="font-bold text-lg text-slate-900">{user.name}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
              {user.role === 'admin' && (
                <span className="mt-2 bg-purple-100 text-purple-700 text-xs font-bold uppercase px-3 py-1 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <div className="p-2">
              <button
                onClick={() => setActiveTab('favorites')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${
                  activeTab === 'favorites' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Heart className="w-5 h-5" /> Saved Places
              </button>
              
              {user.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors mt-1 ${
                    activeTab === 'admin' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Plus className="w-5 h-5" /> Manage Places
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'favorites' && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Favorite Places</h1>
              
              {user.favorites && user.favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.favorites.map((place) => (
                    <div key={place._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group">
                      <div className="h-48 relative">
                        <img 
                          src={place.images?.[0] || 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80'} 
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button 
                          onClick={(e) => { e.preventDefault(); toggleFavorite(place._id); }}
                          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-rose-50 hover:text-rose-500 transition-colors text-rose-500"
                        >
                          <Heart className="w-5 h-5 fill-rose-500" />
                        </button>
                      </div>
                      <div className="p-5">
                        <div className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
                          {place.category}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">{place.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <span className="font-medium text-slate-700">{place.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <Link 
                          to={`/places/${place._id}`}
                          className="block text-center w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2 rounded-xl transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No favorites yet</h3>
                  <p className="text-slate-500 mb-6">Start exploring Bangalore and save your favorite spots.</p>
                  <Link to="/" className="inline-block bg-primary-600 text-white px-6 py-2 rounded-xl font-medium">
                    Explore Places
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'admin' && user.role === 'admin' && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
                <h3 className="font-bold text-lg mb-4">Add New Place</h3>
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Place Name</label>
                      <input
                        type="text"
                        value={newPlace.name}
                        onChange={(e) => setNewPlace({...newPlace, name: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                      <select
                        value={newPlace.category}
                        onChange={(e) => setNewPlace({...newPlace, category: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        {['Hotel', 'Bar', 'Cafe', 'Tourist Spot', 'Mall', 'Tech Park', 'Nightlife', 'Restaurant'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      value={newPlace.description}
                      onChange={(e) => setNewPlace({...newPlace, description: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={newPlace.lat}
                        onChange={(e) => setNewPlace({...newPlace, lat: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={newPlace.lng}
                        onChange={(e) => setNewPlace({...newPlace, lng: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-xl font-medium">
                    Add Place
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
