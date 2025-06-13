import { Router } from 'express';

const router = Router();

// Sample product data
const products = [
    {
        id: 1,
        name: "Kindle E-Reader",
        description: "Lightweight e-reader with a glare-free display and weeks of battery life.",
        price: 149.99,
        image: "https://picsum.photos/id/367/800/600"
    },
    {
        id: 2,
        name: "Vintage Film Camera",
        description: "Capture timeless moments with this classic vintage film camera, perfect for photography enthusiasts.",
        price: 199.99,
        image: "https://picsum.photos/id/250/800/600"
    }
];

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

// Default products route (redirects to grid view)
router.get('/products', (req, res) => {
    res.redirect('/products/grid');
});

// Products page route with display mode validation
router.get('/products/:display', validateDisplayMode, (req, res) => {
    const title = "Our Products";
    const { display } = req.params;
    res.render('products', { title, products, display });
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
