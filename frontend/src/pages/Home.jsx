import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MapContainer } from '../components/MapContainer';
import { Search, MapPin, Star, Filter } from 'lucide-react';

const categories = ['All', 'Hotel', 'Bar', 'Cafe', 'Tourist Spot', 'Mall', 'Tech Park', 'Nightlife', 'Restaurant'];

const Home = () => {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        let url = '/places';
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const { data } = await api.get(url);
        setPlaces(data);
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [search, selectedCategory]);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      {/* Sidebar List */}
      <div className="w-full md:w-[450px] bg-white shadow-xl shadow-slate-200/50 flex flex-col z-10 overflow-hidden shrink-0 border-r border-slate-200">
        
        {/* Search & Filters */}
        <div className="p-6 border-b border-slate-100 space-y-4 bg-white sticky top-0">
          <h1 className="text-2xl font-bold text-slate-900">Explore Bangalore</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search places..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors outline-none text-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category 
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* List of Places */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No places found. Try a different search.
            </div>
          ) : (
            places.map(place => (
              <Link 
                key={place._id} 
                to={`/places/${place._id}`}
                className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-slate-100 hover:border-primary-200 group"
              >
                <div className="flex gap-4 h-32">
                  <div className="w-32 h-full rounded-xl bg-slate-200 overflow-hidden shrink-0">
                    <img 
                      src={place.images && place.images.length > 0 ? place.images[0] : 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80'} 
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex flex-col py-1">
                    <div className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
                      {place.category}
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1 mb-1 group-hover:text-primary-600 transition-colors">
                      {place.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-slate-500 mb-auto mt-1">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="font-medium text-slate-700">{place.rating.toFixed(1)}</span>
                      <span>({place.reviewsCount} reviews)</span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      View on map
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 h-full bg-slate-200 relative hidden md:block">
        <MapContainer places={places} />
      </div>
    </div>
  );
};

export default Home;
