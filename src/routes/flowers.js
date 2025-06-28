import express from 'express';
import db from '../models/db.js';

const router = express.Router();

// GET /flowers - Display all flowers
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM flowers ORDER BY name');
        const flowers = result.rows;
        
        res.render('flowers', { 
            flowers: flowers,
            title: 'Our Flowers'
        });
    } catch (error) {
        console.error('Error fetching flowers:', error);
        res.status(500).send('Error loading flowers');
    }
});

export default router; 