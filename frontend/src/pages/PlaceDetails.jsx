import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Star, Users, ArrowLeft, Heart, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { MapContainer as LeafletMap, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const PlaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { user, toggleFavorite } = useContext(AuthContext);
  
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewers, setViewers] = useState(1);
  
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      try {
        const [placeRes, reviewsRes] = await Promise.all([
          api.get(`/places/${id}`),
          api.get(`/reviews/place/${id}`)
        ]);
        setPlace(placeRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [id]);

  useEffect(() => {
    if (socket && !loading && place) {
      socket.emit('join_place', id);

      socket.on('viewers_update', (count) => {
        setViewers(count);
      });

      socket.on('review_added', (review) => {
        setReviews((prev) => [review, ...prev]);
        setPlace((prev) => ({
          ...prev,
          reviewsCount: prev.reviewsCount + 1
        }));
      });

      return () => {
        socket.emit('leave_place');
        socket.off('viewers_update');
        socket.off('review_added');
      };
    }
  }, [socket, id, loading, place]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to submit a review");
      return;
    }
    
    try {
      setSubmitting(true);
      const { data } = await api.post('/reviews', {
        placeId: id,
        rating,
        comment: newReview
      });
      
      const reviewWithUser = {
        ...data,
        user: { _id: user._id, name: user.name }
      };

      // Emit to socket
      socket.emit('new_review', { placeId: id, review: reviewWithUser });
      setNewReview('');
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const isFavorite = user?.favorites?.includes(id) || user?.favorites?.some(f => f._id === id);

  if (loading) return <div className="h-[calc(100vh-64px)] flex items-center justify-center">Loading...</div>;
  if (!place) return <div className="h-[calc(100vh-64px)] flex items-center justify-center">Place not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="h-[400px] relative">
          <img 
            src={place.images?.[0] || 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80'} 
            alt={place.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
            <div className="text-white">
              <span className="bg-primary-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full mb-3 inline-block">
                {place.category}
              </span>
              <h1 className="text-4xl font-bold mb-2">{place.name}</h1>
              <div className="flex items-center gap-4 text-white/90 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-base">{place.rating.toFixed(1)}</span>
                  <span>({place.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Bangalore</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white border border-white/10">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">{viewers} viewing right now</span>
              </div>
              {user && (
                <button 
                  onClick={() => toggleFavorite(id)}
                  className={`p-3 rounded-full backdrop-blur-md transition-all ${
                    isFavorite 
                    ? 'bg-rose-500/90 text-white shadow-lg shadow-rose-500/30' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-white' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">About</h2>
          <p className="text-slate-600 leading-relaxed">{place.description}</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Live Reviews</h2>
            <span className="text-slate-500">{reviews.length} reviews</span>
          </div>

          {user ? (
            <form onSubmit={submitReview} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-medium text-slate-900 mb-4">Leave a review</h3>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Share your experience..."
                className="w-full border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none mb-4"
                rows="3"
                required
              />
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Post Review
              </button>
            </form>
          ) : (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
              <p className="text-slate-600 mb-4">Please log in to share your experience.</p>
              <button 
                onClick={() => navigate('/login')}
                className="bg-primary-600 text-white px-6 py-2 rounded-xl font-medium"
              >
                Log In
              </button>
            </div>
          )}

          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <div key={review._id || idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                      {review.user?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{review.user?.name || 'Anonymous'}</h4>
                      <div className="text-xs text-slate-500">
                        {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : 'Just now'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold">{review.rating}</span>
                  </div>
                </div>
                <p className="text-slate-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="font-bold text-slate-900 mb-4">Location Details</h3>
            <div className="aspect-square bg-slate-100 rounded-xl mb-4 overflow-hidden z-0 relative">
               <LeafletMap 
                 center={[place.location.lat, place.location.lng]} 
                 zoom={15} 
                 className="w-full h-full absolute inset-0 z-0"
                 zoomControl={false}
                 dragging={false}
                 scrollWheelZoom={false}
               >
                 <TileLayer
                   url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                 />
                 <Marker position={[place.location.lat, place.location.lng]} />
               </LeafletMap>
            </div>
            <div className="flex items-start gap-3 text-sm text-slate-600 mb-4">
              <MapPin className="w-5 h-5 text-primary-600 shrink-0" />
              <p>Bangalore, Karnataka, India<br/>Coordinates: {place.location.lat.toFixed(4)}, {place.location.lng.toFixed(4)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;
