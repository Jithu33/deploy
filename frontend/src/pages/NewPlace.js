import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { createPlace } from '../api/api';
import { AuthContext } from '../context/auth-context';
import './NewPlace.css';

const NewPlace = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [useImageUrl, setUseImageUrl] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const titleChangeHandler = (event) => {
    setTitle(event.target.value);
  };

  const descriptionChangeHandler = (event) => {
    setDescription(event.target.value);
  };

  const addressChangeHandler = (event) => {
    setAddress(event.target.value);
  };

  const imageUrlChangeHandler = (event) => {
    setImageUrl(event.target.value);
  };

  const imageFileChangeHandler = (event) => {
    setImageFile(event.target.files[0]);
  };

  const toggleImageInputType = () => {
    setUseImageUrl(!useImageUrl);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setError(null);
    
    if (!auth.isLoggedIn) {
      setError('You need to be logged in to create a place.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let finalImageUrl = imageUrl;
      
      // If using file upload instead of URL
      if (!useImageUrl && imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        // Upload the image first
        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`
          },
          body: formData
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.message || 'Image upload failed');
        }
        
        finalImageUrl = responseData.imageUrl;
      }
      
      // Then create the place with the image URL (either provided or from upload)
      await createPlace(
        {
          title,
          description,
          address,
          imageUrl: finalImageUrl
        },
        auth.token
      );
      
      navigate('/');
    } catch (err) {
      setError(err.message || 'Creating place failed, please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="new-place-container">
      <h2>Add a New Place</h2>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={submitHandler}>
        <div className="form-control">
          <label htmlFor="title">Title</label>
          <input 
            type="text" 
            id="title" 
            value={title}
            onChange={titleChangeHandler}
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="description">Description</label>
          <textarea 
            id="description" 
            rows="3"
            value={description}
            onChange={descriptionChangeHandler}
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="address">Address</label>
          <input 
            type="text" 
            id="address" 
            value={address}
            onChange={addressChangeHandler}
            required
          />
        </div>
        
        <div className="form-control">
          <div className="image-input-toggle">
            <button 
              type="button" 
              className={`toggle-btn ${useImageUrl ? 'active' : ''}`}
              onClick={toggleImageInputType}
            >
              Image URL
            </button>
            <button 
              type="button" 
              className={`toggle-btn ${!useImageUrl ? 'active' : ''}`}
              onClick={toggleImageInputType}
            >
              Upload Image
            </button>
          </div>
          
          {useImageUrl ? (
            <>
              <label htmlFor="imageUrl">Image URL</label>
              <input 
                type="text" 
                id="imageUrl" 
                value={imageUrl}
                onChange={imageUrlChangeHandler}
                required={useImageUrl}
              />
            </>
          ) : (
            <>
              <label htmlFor="imageFile">Upload Image</label>
              <input 
                type="file" 
                id="imageFile" 
                accept=".jpg,.png,.jpeg"
                onChange={imageFileChangeHandler}
                required={!useImageUrl}
              />
              {imageFile && (
                <div className="image-preview">
                  <p>File selected: {imageFile.name}</p>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="place-actions">
          <button 
            type="submit" 
            className="btn" 
            disabled={isLoading}
          >
            {isLoading ? 'ADDING...' : 'ADD PLACE'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPlace;