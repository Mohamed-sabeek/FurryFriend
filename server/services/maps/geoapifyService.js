const axios = require('axios');

// In-memory cache
const placesCache = new Map();
const routesCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const searchNearbyVeterinaryHospitals = async (latitude, longitude, radius = 8000, limit = 5) => {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    throw new Error('GEOAPIFY_API_KEY is not configured');
  }

  // Cache key based on rounded coordinates and radius
  const cacheKey = `${parseFloat(latitude).toFixed(3)},${parseFloat(longitude).toFixed(3)}_${radius}_${limit}`;
  if (placesCache.has(cacheKey)) {
    const cached = placesCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log('⚡ Using cached Geoapify Places results for', cacheKey);
      return cached.data;
    }
    placesCache.delete(cacheKey);
  }

  try {
    // Geoapify Places API for veterinary hospitals
    const url = `https://api.geoapify.com/v2/places?categories=healthcare.veterinary&filter=circle:${longitude},${latitude},${radius}&bias=proximity:${longitude},${latitude}&limit=${limit}&apiKey=${apiKey}`;
    
    let response;
    let retries = 2;
    while (retries >= 0) {
      try {
        response = await axios.get(url, { timeout: 5000 });
        break; // Success
      } catch (err) {
        if (retries === 0) throw err;
        console.warn(`Geoapify request failed, retrying... (${retries} retries left)`);
        retries--;
      }
    }
    
    const data = response.data;

    if (!data.features || data.features.length === 0) {
      return [];
    }

    const hospitals = data.features.map((feature) => {
      const props = feature.properties;
      return {
        id: props.place_id,
        name: props.name || 'Veterinary Clinic',
        address: props.address_line2 || props.formatted || 'Address not available',
        lat: props.lat,
        lng: props.lon, // Note: geoapify returns lon
        distanceNum: props.distance ? (props.distance / 1000) : 0,
        distance: props.distance ? `${(props.distance / 1000).toFixed(1)} km` : 'Unknown',
        website: props.website || null,
        phone: props.contact?.phone || 'Not available',
        city: props.city || null,
        postcode: props.postcode || null,
        emergency: props.name?.toLowerCase().includes('emergency') || false,
        open: true, // Geoapify free tier doesn't reliably give opening hours, assume open
        rating: '4.5', // Mock rating as Geoapify Places doesn't return ratings
        userRatingsTotal: Math.floor(Math.random() * 50) + 10 // Mock reviews count
      };
    });

    // Cleanup old cache entries
    if (placesCache.size > 100) {
      const now = Date.now();
      for (const [key, val] of placesCache.entries()) {
        if (now - val.timestamp > CACHE_TTL_MS) placesCache.delete(key);
      }
    }

    placesCache.set(cacheKey, { timestamp: Date.now(), data: hospitals });
    return hospitals;

  } catch (error) {
    console.error('Error fetching from Geoapify Places:', error.message);
    throw error;
  }
};

const getRoute = async (startLat, startLng, endLat, endLng) => {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    throw new Error('GEOAPIFY_API_KEY is not configured');
  }

  const cacheKey = `${startLat},${startLng}_${endLat},${endLng}`;
  if (routesCache.has(cacheKey)) {
    const cached = routesCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
    routesCache.delete(cacheKey);
  }

  try {
    const url = `https://api.geoapify.com/v1/routing?waypoints=${startLat},${startLng}|${endLat},${endLng}&mode=drive&apiKey=${apiKey}`;
    const response = await axios.get(url, { timeout: 5000 });
    
    if (!response.data.features || response.data.features.length === 0) {
      throw new Error('No route found');
    }

    const feature = response.data.features[0];
    const distanceKm = (feature.properties.distance / 1000).toFixed(1);
    const timeMins = Math.ceil(feature.properties.time / 60);

    const result = {
      distance: `${distanceKm} km`,
      time: `${timeMins} min`,
      // GeoJSON LineString coordinates are [lon, lat], Leaflet expects [lat, lon]
      coordinates: feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]])
    };

    routesCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;

  } catch (error) {
    console.error('Error fetching from Geoapify Routing:', error.message);
    throw error;
  }
};

module.exports = {
  searchNearbyVeterinaryHospitals,
  getRoute
};
