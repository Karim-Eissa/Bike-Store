const express = require('express');
const router = express.Router();
const upload = require('./middleware/upload'); 
const controller = require('./controller');

require('dotenv').config();

router.get('/home', controller.home_get); 
router.get('/add-bike', controller.add_get); 
router.post('/add-bike', upload.single('image'), controller.add_post); 
router.get('/category/:id', controller.categoryBikes_get);
router.get('/confirmation', controller.confirmation_get);
router.get('/bookings', controller.bookings_get);
router.get('/bike/:id', controller.bikeDetails_get);
router.get('/book/:id', controller.book_get); 
router.post('/book/:id', controller.book_post); 
router.get('/delete-bike/:id', controller.deleteBike_get);
router.get('/add-client', controller.addClient_get);
router.post('/add-client', controller.addClient_post);
module.exports = router;
