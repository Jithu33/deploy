import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { getPlaces } from '../api/api';
import './Places.css';

const Places = () => {
  const [loadedPlaces, setLoadedPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true);
      try {
        const responseData = await getPlaces();
        setLoadedPlaces(responseData.places);
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
    };
    
    fetchPlaces();
  }, []);

  return (
    <div className="places-page">
      <h2>All Places</h2>
      {isLoading && <p className="center">Loading...</p>}
      {error && <p className="error-text center">{error}</p>}
      {!isLoading && !error && loadedPlaces.length === 0 && (
        <p className="center">No places found. Maybe create one?</p>
      )}
      {!isLoading && !error && loadedPlaces.length > 0 && (
        <ul className="place-list">
          {loadedPlaces.map(place => (
            <li className="place-item" key={place.id}>
              <div className="place-item__image">
                <img src={place.imageUrl} alt={place.title} />
              </div>
              <div className="place-item__info">
                <h3>{place.title}</h3>
                <p>{place.address}</p>
              </div>
              <div className="place-item__actions">
                <Link to={`/places/${place.id}`} className="btn">VIEW DETAILS</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Places;