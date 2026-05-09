const express = require('express');
const router = express.Router();
const locationController = require('../controllers/featuresController');

router.get('/alllocation', locationController.getAllLocations);
router.post('/createlocation', locationController.createLocation);
router.delete('/deletelocation/:id', locationController.deleteLocation);
router.get('/all', locationController.getAllCategories);
router.post('/create', locationController.createCategory);
router.delete('/delete/:id', locationController.deleteCategory);

module.exports = router;