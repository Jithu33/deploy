// const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://deploy-backend.onrender.com/api';
const handleApiError = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  return handleApiError(response);
};

export const signupUser = async (name, email, password) => {
  const response = await fetch(`${API_URL}/users/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });
  
  return handleApiError(response);
};

export const getUsers = async () => {
  const response = await fetch(`${API_URL}/users`);
  return handleApiError(response);
};

export const getPlaces = async () => {
  const response = await fetch(`${API_URL}/places`);
  return handleApiError(response);
};

export const getPlaceById = async (placeId) => {
  const response = await fetch(`${API_URL}/places/${placeId}`);
  return handleApiError(response);
};

export const getUserPlaces = async (userId) => {
  const response = await fetch(`${API_URL}/places/user/${userId}`);
  return handleApiError(response);
};

export const createPlace = async (placeData, token) => {
  const response = await fetch(`${API_URL}/places`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(placeData)
  });
  
  return handleApiError(response);
};

export const updatePlace = async (placeId, placeData, token) => {
  const response = await fetch(`${API_URL}/places/${placeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(placeData)
  });
  
  return handleApiError(response);
};

export const deletePlace = async (placeId, token) => {
  const response = await fetch(`${API_URL}/places/${placeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleApiError(response);
};
