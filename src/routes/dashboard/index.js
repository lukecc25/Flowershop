import express from 'express';
import { getAllProducts, addProduct } from '../../models/products/index.js';
 
const router = express.Router();
 
/**
 * Dashboard home page - displays navigation to product management features
 */
router.get('/', async (req, res, next) => {
    if (!req.session.isLoggedIn) {
    res.locals.errors.push('Please log in to access the dashboard');
    return res.render('accounts/login', {
        title: 'Login'
        });
    }
    try {
        const products = await getAllProducts();
        res.render('dashboard/index', {
            title: 'Dashboard',
            products: products
        });
    } catch (error) {
        next(error);
    }
});
 
/**
 * Display the add product form
 */
router.get('/add-product', (req, res) => {
    if (!req.session.isLoggedIn) {
    res.locals.errors.push('Please log in to access the dashboard');
    return res.render('accounts/login', {
        title: 'Login'
        });
    }
    res.render('dashboard/add-product', {
        title: 'Add Product',
        errors: null,
        formData: {}
    });
});
 
/**
 * Process the add product form submission
 */
router.post('/add-product', async (req, res, next) => {
    if (!req.session.isLoggedIn) {
    res.locals.errors.push('Please log in to access the dashboard');
    return res.render('accounts/login', {
        title: 'Login'
        });
    }
    try {
        // Extract form data
        const { name, description, price, image } = req.body;
 
        // Basic server-side validation
        const errors = [];
 
        if (!name || name.trim().length === 0) {
            errors.push('Product name is required');
        }
 
        if (!description || description.trim().length === 0) {
            errors.push('Product description is required');
        }
 
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            errors.push('Valid product price is required');
        }
 
        if (!image || image.trim().length === 0) {
            errors.push('Product image URL is required');
        }
 
        // If validation errors exist, redisplay the form
        if (errors.length > 0) {
            return res.render('dashboard/add-product', {
                title: 'Add Product',
                errors: errors,
                formData: req.body
            });
        }
 
        // Prepare product data
        const productData = {
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            image: image.trim()
        };
 
        // Add product to database
        const newProduct = await addProduct(productData);
 
        // Redirect to dashboard with success message
        res.redirect('/dashboard?success=Product added successfully');
 
    } catch (error) {
        console.error('Error processing add product form:', error);
 
        // Redisplay form with error message
        res.render('dashboard/add-product', {
            title: 'Add Product',
            errors: ['An error occurred while adding the product. Please try again.'],
            formData: req.body
        });
    }
});
 
/**
 * Display the edit product page (placeholder for future assignment)
 */
router.get('/edit-product', (req, res) => {
    if (!req.session.isLoggedIn) {
    res.locals.errors.push('Please log in to access the dashboard');
    return res.render('accounts/login', {
        title: 'Login'
        });
    }
    res.render('dashboard/edit-product', {
        title: 'Edit Product'
    });
});
 
export default router;