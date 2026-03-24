const express = require('express');
const router = express.Router();
const bearingController = require('../controllers/bearingController');

router.get('/buscar', bearingController.searchBearings);
router.get('/categoria/:category', bearingController.getBearingsByCategory);

module.exports = router;