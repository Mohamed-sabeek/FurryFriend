import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation2, Star, Phone, MapPin, Clock, Siren, Globe, X, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:20px;height:20px;background:#6C5CE7;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(108,92,231,0.3)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const hospitalIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:28px;height:28px;background:#00B894;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px">🏥</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const emergencyIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:28px;height:28px;background:#E17055;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px">🚨</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const MapBounds = ({ hospitals, userLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const bounds = L.latLngBounds();
    if (userLocation) bounds.extend([userLocation.lat, userLocation.lng]);
    hospitals.forEach(h => { if (h.lat && h.lng) bounds.extend([h.lat, h.lng]); });
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, hospitals, userLocation]);
  return null;
};

const HospitalCard = ({ hospital, index, onBook, onDirections, isLoadingDirections }) => {
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-primary/30 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <h4 className="font-bold text-gray-800 text-[13px] truncate">{hospital.name}</h4>
          {hospital.emergency && (
            <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600 uppercase tracking-wider">Emergency</span>
          )}
        </div>
        
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500">
          <span className="flex items-center gap-0.5">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="font-semibold text-gray-700">{hospital.rating}</span>
            <span className="text-[9px] text-gray-400 ml-0.5">({hospital.userRatingsTotal || 0})</span>
          </span>
          <span className="flex items-center gap-0.5">
            <MapPin size={10} className="text-primary" />
            {hospital.distance}
          </span>
          <span className={`font-semibold flex items-center gap-1 ${hospital.open ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${hospital.open ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {hospital.open ? 'Open' : 'Closed'}
          </span>
          {hospital.phone && hospital.phone !== 'Not available' && (
            <span className="flex items-center gap-0.5 truncate">
              <Phone size={10} />
              {hospital.phone}
            </span>
          )}
          {hospital.website && (
            <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 truncate text-blue-500 hover:underline">
              <Globe size={10} />
              Website
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto mt-1 sm:mt-0">
        <button
          onClick={() => onDirections(hospital)}
          disabled={isLoadingDirections}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-gray-600 bg-gray-100 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          title="Get Directions"
        >
          {isLoadingDirections ? <Loader2 size={14} className="animate-spin" /> : <Navigation2 size={14} />}
          <span>Directions</span>
        </button>
        <button
          onClick={() => onBook(hospital)}
          className="flex-[3] sm:flex-none px-4 py-1.5 bg-primary text-white text-[12px] font-bold rounded-lg hover:bg-primary-dark shadow-sm transition-colors"
        >
          Book
        </button>
      </div>
    </motion.div>
  );
};

const InteractiveMap = ({ data, onBookHospital }) => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loadingRouteFor, setLoadingRouteFor] = useState(null);

  if (!data) return null;
  const { hospitals = [], userLocation = null } = data;

  const handleGetDirections = async (hospital) => {
    if (!userLocation) return;
    setLoadingRouteFor(hospital.id || hospital.placeId);
    setRouteData(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/maps/route?startLat=${userLocation.lat}&startLng=${userLocation.lng}&endLat=${hospital.lat}&endLng=${hospital.lng}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setRouteData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to get directions', err);
    }
    setLoadingRouteFor(null);
  };

  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : hospitals.length > 0 ? [hospitals[0].lat, hospitals[0].lng] : [20.5937, 78.9629];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden my-2 max-w-[95%] xl:max-w-[85%]"
    >
      {/* Compact Map Area */}
      <div className="w-full h-[160px] md:h-[180px] lg:h-[220px] relative z-0 border-b border-gray-100 bg-gray-50">
        <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="w-full h-full z-0">
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBounds hospitals={hospitals} userLocation={userLocation} />

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup><div className="font-bold text-[11px] text-center py-0.5">📍 You</div></Popup>
            </Marker>
          )}

          {hospitals.map((hospital, idx) => {
            if (!hospital.lat || !hospital.lng) return null;
            return (
              <Marker
                key={idx}
                position={[hospital.lat, hospital.lng]}
                icon={hospital.emergency ? emergencyIcon : hospitalIcon}
              >
                <Popup className="min-w-[120px]">
                  <div className="p-0.5 text-center">
                    <h4 className="font-bold text-[12px] text-gray-800 mb-1.5 leading-tight">{hospital.name}</h4>
                    <button
                      onClick={() => onBookHospital(hospital)}
                      className="w-full bg-primary text-white text-[10px] font-bold py-1 rounded hover:bg-primary-dark transition-colors"
                    >
                      Book
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        {/* Route Polyline */}
        {routeData && routeData.coordinates && (
          <Polyline positions={routeData.coordinates} color="#6C5CE7" weight={4} opacity={0.8} dashArray="5, 10" />
        )}

        {/* Absolute floating pill for title to save space */}
        <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-1.5">
          <MapPin size={12} className="text-primary" />
          <span className="text-[11px] font-bold text-gray-700">Top Nearby Clinics</span>
        </div>

        {/* Route Details Overlay */}
        {routeData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-3 right-3 z-[400] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md border border-gray-100 flex flex-col gap-0.5"
          >
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Estimated Trip</div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[12px] font-bold text-blue-600">
                <Clock size={12} /> {routeData.time}
              </span>
              <span className="flex items-center gap-1 text-[12px] font-bold text-gray-700">
                <Navigation2 size={12} /> {routeData.distance}
              </span>
            </div>
            <button onClick={() => setRouteData(null)} className="absolute -top-2 -right-2 bg-gray-200 hover:bg-red-500 hover:text-white rounded-full p-0.5 transition-colors">
              <X size={12} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Hospital Cards List (Compact) */}
      <div className="bg-gray-50/50 p-3">
        <div className="max-h-[260px] overflow-y-auto custom-scrollbar flex flex-col gap-2.5 pr-1">
          {hospitals.map((hospital, idx) => (
            <HospitalCard
              key={idx}
              hospital={hospital}
              index={idx}
              onBook={onBookHospital}
              onDirections={handleGetDirections}
              isLoadingDirections={loadingRouteFor === (hospital.id || hospital.placeId)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveMap;
