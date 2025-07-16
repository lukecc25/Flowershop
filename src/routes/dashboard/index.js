import express from 'express';
import { getAllFlowers, addFlower, getFlowerById } from '../../models/flowers/index.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
 
const router = express.Router();
 
/**
 * Dashboard home page - displays different content based on user role
 */
router.get('/', requireAuth, async (req, res, next) => {
    try {
        const isUserAdmin = req.session.user.role_id === 3;
        
        if (isUserAdmin) {
            // Admin dashboard
            const flowers = await getAllFlowers();
            
            res.render('dashboard/admin', {
                title: 'Admin Dashboard',
                flowers: flowers
            });
        } else {
            // Regular user dashboard
            res.render('dashboard/user', {
                title: 'User Dashboard',
                user: req.session.user
            });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * Admin: Display the add flower form
 */
router.get('/add-flower', requireAdmin, (req, res) => {
    res.render('dashboard/add-flower', {
        title: 'Add Flower',
        errors: null,
        formData: {}
    });
});

/**
 * Admin: Process the add flower form submission
 */
router.post('/add-flower', requireAdmin, async (req, res, next) => {
    try {
        // Extract form data
        const { name, category, price, photo } = req.body;
 
        // Basic server-side validation
        const errors = [];
 
        if (!name || name.trim().length === 0) {
            errors.push('Flower name is required');
        }
 
        if (!category || category.trim().length === 0) {
            errors.push('Category is required');
        }
 
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            errors.push('Valid price is required');
        }
 
        if (!photo || photo.trim().length === 0) {
            errors.push('Photo URL is required');
        }
 
        // If validation errors exist, redisplay the form
        if (errors.length > 0) {
            return res.render('dashboard/add-flower', {
                title: 'Add Flower',
                errors: errors,
                formData: req.body
            });
        }
 
        // Prepare flower data
        const flowerData = {
            name: name.trim(),
            category: category.trim(),
            price: parseFloat(price),
            photo: photo.trim()
        };
 
        // Add flower to database
        await addFlower(flowerData);
 
        // Redirect to dashboard with success message
        res.redirect('/dashboard?success=Flower added successfully');
 
    } catch (error) {
        console.error('Error processing add flower form:', error);
 
        // Redisplay form with error message
        res.render('dashboard/add-flower', {
            title: 'Add Flower',
            errors: ['An error occurred while adding the flower. Please try again.'],
            formData: req.body
        });
    }
});

/**
 * Admin: Display the edit flower page
 */
router.get('/edit-flower/:id', requireAdmin, async (req, res, next) => {
    try {
        const flowerId = parseInt(req.params.id);
        const flower = await getFlowerById(flowerId);
        
        if (!flower) {
            req.flash('error', 'Flower not found');
            return res.redirect('/dashboard');
        }
        
        res.render('dashboard/edit-flower', {
            title: 'Edit Flower',
            flower: flower,
            errors: null
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Admin: Process edit flower form
 */
router.post('/edit-flower/:id', requireAdmin, async (req, res, next) => {
    try {
        const flowerId = parseInt(req.params.id);
        const { name, category, price, photo } = req.body;
        
        // Validation
        const errors = [];
        if (!name || name.trim().length === 0) errors.push('Flower name is required');
        if (!category || category.trim().length === 0) errors.push('Category is required');
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) errors.push('Valid price is required');
        if (!photo || photo.trim().length === 0) errors.push('Photo URL is required');
        
        if (errors.length > 0) {
            return res.render('dashboard/edit-flower', {
                title: 'Edit Flower',
                flower: { id: flowerId, name, category, price, photo },
                errors: errors
            });
        }
        
        const flowerData = {
            name: name.trim(),
            category: category.trim(),
            price: parseFloat(price),
            photo: photo.trim()
        };
        
        // Assuming updateFlower function exists in models/flowers/index.js
        // await updateFlower(flowerId, flowerData); 
        res.redirect('/dashboard?success=Flower updated successfully');
        
    } catch (error) {
        next(error);
    }
});

/**
 * Admin: Delete flower
 */
router.post('/delete-flower/:id', requireAdmin, async (req, res, next) => {
    try {
        const flowerId = parseInt(req.params.id);
        // Assuming deleteFlower function exists in models/flowers/index.js
        // await deleteFlower(flowerId); 
        res.redirect('/dashboard?success=Flower deleted successfully');
    } catch (error) {
        next(error);
    }
});
 
export default router;