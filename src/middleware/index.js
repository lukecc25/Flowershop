// import { getNavigationCategories } from '../models/categories/index.js';

// Middleware to add global data to res.locals
export const addGlobalData = async (req, res, next) => {
    // Current year for copyright
    res.locals.currentYear = new Date().getFullYear();

    // NODE_ENV for all views
    res.locals.NODE_ENV = process.env.NODE_ENV || 'development';

    // Navigation categories - skip for now since categories table doesn't exist
    res.locals.navigationCategories = [];

    // Calculate cart count
    let cartCount = 0;
    if (req.session && req.session.cart && req.session.cart.bouquets) {
        cartCount = req.session.cart.bouquets.reduce((total, bouquet) => {
            return total + bouquet.items.reduce((bouquetTotal, item) => {
                return bouquetTotal + (item.quantity || 0);
            }, 0);
        }, 0);
    }
    res.locals.cartCount = cartCount;

    next();
};

// Middleware to add a formatted timestamp
export const addTimestamp = (req, res, next) => {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    res.locals.timestamp = now.toLocaleDateString('en-US', options);
    next();
};

// Middleware to set a custom header
export const poweredByHeader = (req, res, next) => {
    res.setHeader('X-Powered-By', 'Express Middleware Tutorial');
    next();
};

// Middleware to log request processing time
export const measureProcessingTime = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} - ${duration}ms`);
    });
    next();
};

// Middleware to validate the display mode param
export const validateDisplayMode = (req, res, next) => {
    const { display } = req.params;
    if (display !== 'grid' && display !== 'details') {
        return res.status(400).send('Invalid display mode: must be either "grid" or "details".');
    }
    next();
};
