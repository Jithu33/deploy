const express = require('express');
const router = express.Router();

const placesControllers = require('../controllers/places-controllers');
const checkAuth = require('../middleware/check-auth');


router.get('/', placesControllers.getAllPlaces);


router.get('/:pid', placesControllers.getPlaceById);


router.get('/user/:uid', placesControllers.getPlacesByUserId);


router.use(checkAuth);


router.post('/', placesControllers.createPlace);


router.patch('/:pid', placesControllers.updatePlace);


router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;