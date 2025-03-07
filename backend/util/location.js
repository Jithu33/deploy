const axios = require('axios');

async function getCoordsForAddress(address) {
  // URL encode the address
  const encodedAddress = encodeURIComponent(address);
  
  try {
    // Use Nominatim API (OpenStreetMap)
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PlacesApp/1.0' // Nominatim requires a user agent
        }
      }
    );

    // Check if we got any results
    if (!response.data || response.data.length === 0) {
      throw new Error('Could not find location for the specified address.');
    }

    const data = response.data[0];
    const coordinates = {
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon)
    };

    return coordinates;
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Could not get location. Please try again later.');
  }
}

module.exports = getCoordsForAddress;