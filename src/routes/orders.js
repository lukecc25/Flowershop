import express from 'express';
import { getUserOrders } from '../models/accounts/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Display user's order history (only for logged-in users)
 */
router.get('/history', requireAuth, async (req, res) => {
    try {
        const orders = await getUserOrders(req.session.user.id);
        
        res.render('orders/history', {
            title: 'Order History',
            orders: orders
        });
    } catch (error) {
        console.error('Error fetching order history for user', req.session.user && req.session.user.id, ':', error);
        req.flash('error', 'Error loading order history: ' + error.message);
        res.redirect('/accounts/account');
    }
});

/**
 * Display order confirmation page
 */
router.get('/confirmation/:orderId', (req, res) => {
    const { orderId } = req.params;
    
    res.render('orders/confirmation', {
        title: 'Order Confirmation',
        orderId: orderId
    });
});

export default router; 