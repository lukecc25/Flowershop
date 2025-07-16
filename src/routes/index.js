import { Router } from 'express';

const router = Router();

// Removed products array and /products routes

// Middleware to validate display parameter
const validateDisplayMode = (req, res, next) => {
    const { display } = req.params;
    if (display !== 'grid' && display !== 'details') {
        const error = new Error('Invalid display mode: must be either "grid" or "details".');
        return next(error); // return here to avoid calling next() twice
    }
    next(); // valid mode, continue
};

// Home page route
router.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

// About page route  
router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

// Error handling middleware (must come after all routes)
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: err.message, 
        error: process.env.NODE_ENV === 'development' ? err : {} 
    });
});

export default router;
