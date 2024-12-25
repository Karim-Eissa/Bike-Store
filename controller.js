const express=require('express');
const db = require('./db'); 
const moment = require('moment');
require('dotenv').config();
module.exports={	
    home_get: async (req, res) => {
        try {
            const [categories] = await db.promise().query('SELECT * FROM categories');
            res.render('home', { categories });
        } catch (err) {
            console.error('Error fetching categories:', err);
            res.status(500).send('Error fetching categories');
        }
    },
    confirmation_get: async (req, res) => {
        try {
            res.render('confirmation');
        } catch (err) {
            res.status(500).send('Couldn\'t book please retry later');
        }
    },
    bookings_get: async (req, res) => {
        try {
            const [bookings] = await db.promise().query(
                `SELECT bookings.*, bikes.make, bikes.model, clients.first_name, clients.last_name
                FROM bookings
                JOIN bikes ON bookings.bike_id = bikes.id
                JOIN clients ON bookings.client_id = clients.id`
            );
            bookings.forEach(booking => {
                booking.start_date = moment(booking.start_date).format('YYYY-MM-DD');
                booking.end_date = moment(booking.end_date).format('YYYY-MM-DD');
                booking.created_at = moment(booking.created_at).format('YYYY-MM-DD');
            });
    
            res.render('bookings', { bookings });
        } catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    
    add_get: async (req, res) => {
        const categoriesQuery = 'SELECT * FROM categories';
        const brandsQuery = 'SELECT * FROM brands';
        Promise.all([
            db.promise().query(categoriesQuery),
            db.promise().query(brandsQuery)
        ])
        .then(([categoriesResult, brandsResult]) => {
            res.render('add', {
            categories: categoriesResult[0],
            brands: brandsResult[0]
            });
        })
        .catch((err) => {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
        });
    },
    deleteBike_get: async (req, res) => {
        const bikeId = req.params.id;
        try {
            await db.promise().query(
                'DELETE FROM bikes WHERE id = ?',
                [bikeId]
            );
            res.redirect('/'); 
        } catch (error) {
            console.error('Error deleting bike:', error);
            res.status(500).send('Error deleting bike');
        }
    },
    categoryBikes_get: async (req, res) => {
        const categoryId = req.params.id;
        console.log(categoryId)
        try {
            const [bikes] = await db.promise().query(
                `SELECT bikes.*, brands.name AS brand_name, categories.name AS category_name 
                 FROM bikes 
                 INNER JOIN brands ON bikes.brand_id = brands.id
                 INNER JOIN categories ON bikes.category_id = categories.id
                 WHERE bikes.category_id = ? `,
                [categoryId]
            );
            bikes.forEach(bike => {
                console.log(bike); 
            });
            if (bikes.length === 0) {
                return res.render('categoryBikes', { bikes: [], categoryName: "No bikes found for this category" });
            }
    
            const categoryName = bikes[0].category_name;
    
            res.render('categoryBikes', { bikes, categoryName });
        } catch (error) {
            console.error("Error fetching bikes by category:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    bikeDetails_get: async (req, res) => {
        const bikeId = req.params.id; 
        try {
            const [bikeDetails] = await db.promise().query(
                `SELECT bikes.*, brands.name AS brand_name, categories.name AS category_name
                 FROM bikes
                 INNER JOIN brands ON bikes.brand_id = brands.id
                 INNER JOIN categories ON bikes.category_id = categories.id
                 WHERE bikes.id = ?`,
                [bikeId]
            );

            if (bikeDetails.length === 0) {
                return res.status(404).send("Bike not found");
            }

            res.render('bikeDetails', { bike: bikeDetails[0] }); 
        } catch (error) {
            console.error("Error fetching bike details:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    add_post: async (req, res) => {
        try {
            const { make, model, year, price, description, status, brand_id, category_id } = req.body;
            const image = req.file; 
            const imageUrl = image ? `/images/${image.filename}` : null;
    
            await db.promise().query(
                `INSERT INTO bikes (make, model, year, price, description, image_url, status, brand_id, category_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [make, model, year, price, description, imageUrl, status, brand_id, category_id]
            );
    
            res.redirect('/home');
        } catch (err) {
            console.error('Error adding bike:', err);
            res.status(500).send('Error adding bike');
        }
    },
    book_get: async (req, res) => {
        const bikeId = req.params.id; 

        try {
            const [bike] = await db.promise().query(
                `SELECT bikes.*, brands.name AS brand_name, categories.name AS category_name
                FROM bikes 
                INNER JOIN brands ON bikes.brand_id = brands.id
                INNER JOIN categories ON bikes.category_id = categories.id
                WHERE bikes.id = ?`,
                [bikeId]
            );
            const [clients] = await db.promise().query('SELECT * FROM clients');

            if (bike.length === 0) {
                return res.render('book', { bike: null, clients: [], errorMessage: "Bike not found" });
            }

            res.render('book', { bike: bike[0], clients, categoryName: bike[0].category_name });
        } catch (error) {
            console.error("Error fetching bike or clients:", error);
            res.status(500).send("Internal Server Error");
        }
    },

    book_post: async (req, res) => {
        const { client_id, start_date, end_date} = req.body;
        bike_id =req.params.id;
        try {
            await db.promise().query(
                `INSERT INTO bookings (bike_id, client_id, start_date, end_date, status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())`,
                [bike_id, client_id, start_date, end_date]
            );
            res.redirect(`/confirmation`);
        } catch (error) {
            console.error('Error creating booking:', error);
            res.status(500).send('Error creating booking');
        }
    },
    addClient_get: (req, res) => {
        res.render('addClient');
    },
    addClient_post: async (req, res) => {
        const { first_name, last_name, email, phone_number, address } = req.body;
        
        try {
            await db.promise().query(
                `INSERT INTO clients (first_name, last_name, email, phone_number, address, created_at) 
                VALUES (?, ?, ?, ?, ?, NOW())`,
                [first_name, last_name, email, phone_number, address]
            );
            
            res.redirect('/');  
        } catch (err) {
            console.error('Error adding client:', err);
            res.status(500).send('Error adding client');
        }
    }
}