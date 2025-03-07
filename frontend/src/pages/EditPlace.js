import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { getPlaceById, updatePlace } from '../api/api';
import { AuthContext } from '../context/auth-context';

const EditPlace = () => {
  const auth = useContext(AuthContext);
  const { placeId } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [place, setPlace] = useState(null);
  const [formState, setFormState] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setIsLoading(true);
        const responseData = await getPlaceById(placeId);
        setPlace(responseData.place);
        setFormState({
          title: responseData.place.title,
          description: responseData.place.description
        });
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    fetchPlace();
  }, [placeId]);

  const inputChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    
    try {
      setIsLoading(true);
      await updatePlace(
        placeId,
        {
          title: formState.title,
          description: formState.description
        },
        auth.token
      );
      
      navigate(`/places/${placeId}`);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="center"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="center"><p className="error-text">{error}</p></div>;
  }

  if (!place) {
    return <div className="center"><p>Could not find place!</p></div>;
  }

  return (
    <form className="place-form" onSubmit={submitHandler}>
      <div className="form-control">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={formState.title}
          onChange={inputChangeHandler}
          required
        />
      </div>
      <div className="form-control">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows="5"
          value={formState.description}
          onChange={inputChangeHandler}
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'UPDATING...' : 'UPDATE PLACE'}
        </button>
      </div>
    </form>
  );
};

export default EditPlace;