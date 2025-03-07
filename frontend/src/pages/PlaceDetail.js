import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { getPlaceById, deletePlace } from '../api/api';
import { AuthContext } from '../context/auth-context';
import './PlaceDetail.css';

const PlaceDetail = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { placeId } = useParams();
  
  const [loadedPlace, setLoadedPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchPlace = async () => {
      setIsLoading(true);
      try {
        const responseData = await getPlaceById(placeId);
        setLoadedPlace(responseData.place);
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
    };
    
    fetchPlace();
  }, [placeId]);

  useEffect(() => {
    // This code runs after loadedPlace state is updated
    if (loadedPlace && loadedPlace.location) {
      const mapContainer = document.getElementById('map-container');
      if (mapContainer) {
        // Use the actual coordinates from the place
        const { lat, lng } = loadedPlace.location;
        
        // Calculate bounding box (rough approximate)
        const latDelta = 0.01;
        const lngDelta = 0.01;
        
        mapContainer.innerHTML = `
          <iframe 
            width="100%" 
            height="100%" 
            frameborder="0" 
            scrolling="no" 
            marginheight="0" 
            marginwidth="0" 
            src="https://www.openstreetmap.org/export/embed.html?bbox=${lng - lngDelta},${lat - latDelta},${lng + lngDelta},${lat + latDelta}&layer=mapnik&marker=${lat},${lng}" 
            style="border: 1px solid #ccc">
          </iframe>
          <br/>
          <small>
            <a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}" target="_blank">View Larger Map</a>
          </small>
        `;
      }
    }
  }, [loadedPlace]);

  const showDeleteWarningHandler = () => {
    setShowConfirmDelete(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmDelete(false);
  };

  const confirmDeleteHandler = async () => {
    setIsLoading(true);
    try {
      await deletePlace(placeId, auth.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <p className="center">Loading...</p>;
  }

  if (error) {
    return <p className="center error-text">{error}</p>;
  }

  if (!loadedPlace) {
    return <p className="center">Could not find that place!</p>;
  }

  return (
    <div className="place-detail">
      {showConfirmDelete && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure?</h3>
            <p>Do you want to delete this place? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-inverse" onClick={cancelDeleteHandler}>CANCEL</button>
              <button className="btn btn-danger" onClick={confirmDeleteHandler}>DELETE</button>
            </div>
          </div>
          <div className="backdrop" onClick={cancelDeleteHandler}></div>
        </div>
      )}
      <div className="place-detail__image">
        <img src={loadedPlace.imageUrl} alt={loadedPlace.title} />
      </div>
      <div className="place-detail__info">
        <h2>{loadedPlace.title}</h2>
        <p>{loadedPlace.address}</p>
        <p>{loadedPlace.description}</p>
      </div>
      <div className="place-detail__map" id="map-container">
        {/* Map will be loaded here by the useEffect */}
      </div>
      <div className="place-detail__actions">
        <Link to="/" className="btn">BACK TO ALL PLACES</Link>
        {auth.isLoggedIn && auth.userId === loadedPlace.creator && (
          <>
            <Link to={`/places/${placeId}/edit`} className="btn">EDIT</Link>
            <button onClick={showDeleteWarningHandler} className="btn btn-danger">DELETE</button>
          </>
        )}
      </div>
    </div>
  );
};

export default PlaceDetail;