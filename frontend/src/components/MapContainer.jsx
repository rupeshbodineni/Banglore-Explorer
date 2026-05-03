import React, { useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon missing issue in Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const center = [12.9716, 77.5946];

export const MapContainer = ({ places }) => {
  const navigate = useNavigate();

  return (
    <LeafletMap 
      center={center} 
      zoom={12} 
      className="w-full h-full z-0"
    >
      {/* Free open-source map tiles from CartoDB (looks modern, similar to light mode maps) */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {places.map((place) => (
        <Marker
          key={place._id}
          position={[place.location.lat, place.location.lng]}
        >
          <Popup className="custom-popup">
            <div 
              className="p-1 w-[200px] cursor-pointer" 
              onClick={() => navigate(`/places/${place._id}`)}
            >
              <img 
                src={place.images?.[0] || 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80'} 
                alt={place.name} 
                className="w-full h-24 object-cover rounded-lg mb-2"
              />
              <h3 className="font-bold text-slate-900 line-clamp-1">{place.name}</h3>
              <p className="text-xs text-primary-600 font-medium mb-1">{place.category}</p>
              <div className="flex items-center gap-1 text-xs text-slate-600 m-0">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                <span>{place.rating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </LeafletMap>
  );
};
