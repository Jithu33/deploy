const mongoose = require('mongoose');

const Place = require('../models/place');
const User = require('../models/user');
const getCoordsForAddress = require('../util/location');

// Get all places
const getAllPlaces = async (req, res, next) => {
  try {
    const places = await Place.find();
    res.json({ places: places.map(place => place.toObject({ getters: true })) });
  } catch (err) {
    console.error('Fetching places error:', err);
    res.status(500).json({ message: 'Fetching places failed.' });
  }
};

// Get place by ID
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  try {
    const place = await Place.findById(placeId);
    
    if (!place) {
      return res.status(404).json({ message: 'Could not find a place with the provided id.' });
    }

    res.json({ place: place.toObject({ getters: true }) });
  } catch (err) {
    console.error('Get place by ID error:', err);
    res.status(500).json({ message: 'Something went wrong, could not find place.' });
  }
};

// Get places by user ID
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  try {
    const userWithPlaces = await User.findById(userId).populate('places');
    
    if (!userWithPlaces || userWithPlaces.places.length === 0) {
      return res.status(404).json({ message: 'Could not find places for the provided user id.' });
    }

    res.json({ 
      places: userWithPlaces.places.map(place => place.toObject({ getters: true })) 
    });
  } catch (err) {
    console.error('Get places by user ID error:', err);
    res.status(500).json({ message: 'Fetching places failed.' });
  }
};

// Create a new place
const createPlace = async (req, res, next) => {
  const { title, description, address, imageUrl } = req.body;
  const userId = req.userData.userId;

  // Get coordinates for address
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return res.status(422).json({ message: error.message || 'Could not get coordinates for the address.' });
  }

  // Create place
  const newPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    imageUrl,
    creator: userId
  });

  try {
    // Check if user exists
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Could not find user for provided id.' });
    }

    // Use transaction to ensure both operations succeed or fail together
    const sess = await mongoose.startSession();
    sess.startTransaction();
    
    await newPlace.save({ session: sess });
    user.places.push(newPlace);
    await user.save({ session: sess });
    
    await sess.commitTransaction();

    res.status(201).json({ place: newPlace.toObject({ getters: true }) });
  } catch (err) {
    console.error('Create place error:', err);
    res.status(500).json({ message: 'Creating place failed, please try again.' });
  }
};

// Update place
const updatePlace = async (req, res, next) => {
  const { title, description } = req.body;
  const placeId = req.params.pid;
  const userId = req.userData.userId;

  try {
    const place = await Place.findById(placeId);
    
    if (!place) {
      return res.status(404).json({ message: 'Could not find place for the provided id.' });
    }

    // Check if the user is the creator of the place
    if (place.creator.toString() !== userId) {
      return res.status(403).json({ message: 'You are not allowed to edit this place.' });
    }

    place.title = title;
    place.description = description;
    
    await place.save();
    
    res.json({ place: place.toObject({ getters: true }) });
  } catch (err) {
    console.error('Update place error:', err);
    res.status(500).json({ message: 'Something went wrong, could not update place.' });
  }
};

// Delete place
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  const userId = req.userData.userId;

  try {
    // Find the place with its creator populated
    const place = await Place.findById(placeId).populate('creator');
    
    if (!place) {
      return res.status(404).json({ message: 'Could not find place for the provided id.' });
    }

    // For populated documents, we need to check the id property of the creator
    // This will be different depending on if creator is populated or not
    const creatorId = place.creator.id || place.creator.toString();
    
    // Check if the user is the creator of the place
    if (creatorId !== userId) {
      return res.status(403).json({ message: 'You are not allowed to delete this place.' });
    }

    // Use transaction to ensure both operations succeed or fail together
    const sess = await mongoose.startSession();
    sess.startTransaction();
    
    // Use deleteOne instead of remove
    await Place.deleteOne({ _id: placeId }).session(sess);
    
    // Find the user and update their places
    const user = await User.findById(userId);
    user.places.pull(placeId);
    await user.save({ session: sess });
    
    await sess.commitTransaction();

    res.json({ message: 'Place deleted.' });
  } catch (err) {
    console.error('Delete place error:', err);
    res.status(500).json({ message: 'Something went wrong, could not delete place.' });
  }
};

module.exports = {
  getAllPlaces,
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace
};