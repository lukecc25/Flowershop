import express from 'express';
import { getFlowerById } from '../models/flowers/index.js';
import { createOrder } from '../models/accounts/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Initialize cart in session if it doesn't exist
 */
const initializeCart = (req) => {
    if (!req.session.cart || !Array.isArray(req.session.cart.bouquets)) {
        req.session.cart = {
            bouquets: [
                { name: 'Bouquet 1', items: [] }
            ],
            total: 0
        };
    }
};

/**
 * Calculate cart total
 */
const calculateCartTotal = (bouquets) => {
    return bouquets.reduce((total, bouquet) => {
        return total + bouquet.items.reduce((bt, item) => bt + (item.price * item.quantity), 0);
    }, 0);
};

/**
 * Get cart count (for AJAX requests)
 */
router.get('/count', (req, res) => {
    let cartCount = 0;
    if (req.session && req.session.cart && req.session.cart.bouquets) {
        cartCount = req.session.cart.bouquets.reduce((total, bouquet) => {
            return total + bouquet.items.reduce((bouquetTotal, item) => {
                return bouquetTotal + (item.quantity || 0);
            }, 0);
        }, 0);
    }
    res.json({ count: cartCount });
});

/**
 * Display cart
 */
router.get('/', (req, res) => {
    initializeCart(req);
    req.session.cart.total = calculateCartTotal(req.session.cart.bouquets);
    res.render('cart/index', {
        title: 'Shopping Cart',
        cart: req.session.cart
    });
});

/**
 * Add item to cart (default to first bouquet)
 */
router.post('/add', async (req, res) => {
    try {
        const { flowerId, flowerType, quantity = 1, bouquetIndex = 0 } = req.body;
        if (!flowerId || !flowerType) {
            if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
                return res.status(400).json({ error: 'Invalid flower information' });
            }
            req.flash('error', 'Invalid flower information');
            return res.redirect('/flowers');
        }
        let flower;
        if (flowerType === 'flower') {
            flower = await getFlowerById(parseInt(flowerId));
            if (flower) {
                flower.price = parseFloat(flower.price);
                flower.name = flower.name;
                flower.image = flower.photo;
            }
        } else {
            // This case should ideally not be reached if flowerType is 'flower'
            // but as a fallback, we can return an error or redirect
            if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
                return res.status(400).json({ error: 'Invalid flower type' });
            }
            req.flash('error', 'Invalid flower type');
            return res.redirect('/flowers');
        }
        if (!flower) {
            if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
                return res.status(404).json({ error: 'Flower not found' });
            }
            req.flash('error', 'Flower not found');
            return res.redirect('/flowers');
        }
        initializeCart(req);
        const bIndex = parseInt(bouquetIndex) || 0;
        const bouquets = req.session.cart.bouquets;
        if (!bouquets[bIndex]) {
            if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
                return res.status(400).json({ error: 'Bouquet not found' });
            }
            req.flash('error', 'Bouquet not found');
            return res.redirect('/flowers');
        }
        // Check if item already exists in this bouquet
        const existingItemIndex = bouquets[bIndex].items.findIndex(
            item => item.id === flowerId && item.type === flowerType
        );
        if (existingItemIndex > -1) {
            bouquets[bIndex].items[existingItemIndex].quantity += parseInt(quantity);
        } else {
            bouquets[bIndex].items.push({
                id: flowerId,
                type: flowerType,
                name: flower.name,
                price: flower.price,
                image: flower.image,
                quantity: parseInt(quantity)
            });
        }
        req.session.cart.total = calculateCartTotal(bouquets);
        
        // Check if this is an AJAX request
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            return res.json({ 
                success: true, 
                message: `${flower.name} added to ${bouquets[bIndex].name}`,
                cartCount: req.session.cart.bouquets.reduce((total, bouquet) => {
                    return total + bouquet.items.reduce((bouquetTotal, item) => {
                        return bouquetTotal + (item.quantity || 0);
                    }, 0);
                }, 0)
            });
        }
        
        req.flash('success', `${flower.name} added to ${bouquets[bIndex].name}`);
        res.redirect('/flowers');
    } catch (error) {
        console.error('Error adding to cart:', error);
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            return res.status(500).json({ error: 'Error adding item to cart' });
        }
        req.flash('error', 'Error adding item to cart');
        res.redirect('/flowers');
    }
});

/**
 * Add a new bouquet
 */
router.post('/add-bouquet', (req, res) => {
    initializeCart(req);
    const bouquets = req.session.cart.bouquets;
    const newBouquetNum = bouquets.length + 1;
    bouquets.push({ name: `Bouquet ${newBouquetNum}`, items: [] });
    req.flash('success', `Bouquet ${newBouquetNum} added!`);
    res.redirect('/cart');
});

/**
 * Move flower to another bouquet
 */
router.post('/move-flower', (req, res) => {
    initializeCart(req);
    const { fromBouquet, toBouquet, itemIndex } = req.body;
    const bouquets = req.session.cart.bouquets;
    const fromIdx = parseInt(fromBouquet);
    const toIdx = parseInt(toBouquet);
    const iIdx = parseInt(itemIndex);
    if (
        bouquets[fromIdx] &&
        bouquets[toIdx] &&
        bouquets[fromIdx].items[iIdx]
    ) {
        const sourceItem = bouquets[fromIdx].items[iIdx];
        
        // Move only 1 item
        if (sourceItem.quantity > 1) {
            // Decrease quantity in source bouquet
            sourceItem.quantity -= 1;
        } else {
            // Remove the entire item if quantity is 1
            bouquets[fromIdx].items.splice(iIdx, 1);
        }
        
        // Add 1 item to target bouquet
        const existing = bouquets[toIdx].items.findIndex(
            it => it.id === sourceItem.id && it.type === sourceItem.type
        );
        if (existing > -1) {
            bouquets[toIdx].items[existing].quantity += 1;
        } else {
            bouquets[toIdx].items.push({
                id: sourceItem.id,
                type: sourceItem.type,
                name: sourceItem.name,
                price: sourceItem.price,
                image: sourceItem.image,
                quantity: 1
            });
        }
        req.flash('success', `1 ${sourceItem.name} moved to ${bouquets[toIdx].name}`);
    } else {
        req.flash('error', 'Could not move flower.');
    }
    req.session.cart.total = calculateCartTotal(bouquets);
    res.redirect('/cart');
});

/**
 * Update cart item quantity
 */
router.post('/update', (req, res) => {
    const { bouquetIndex, itemIndex, quantity } = req.body;
    initializeCart(req);
    const bouquets = req.session.cart.bouquets;
    const bIdx = parseInt(bouquetIndex) || 0;
    const iIdx = parseInt(itemIndex);
    if (!bouquets[bIdx] || !bouquets[bIdx].items[iIdx]) {
        req.flash('error', 'Invalid cart item');
        return res.redirect('/cart');
    }
    const newQuantity = parseInt(quantity);
    if (newQuantity <= 0) {
        bouquets[bIdx].items.splice(iIdx, 1);
    } else {
        bouquets[bIdx].items[iIdx].quantity = newQuantity;
    }
    req.session.cart.total = calculateCartTotal(bouquets);
    req.flash('success', 'Cart updated');
    res.redirect('/cart');
});

/**
 * Update bouquet description
 */
router.post('/update-bouquet-description', (req, res) => {
    const { bouquetIndex, description } = req.body;
    initializeCart(req);
    const bouquets = req.session.cart.bouquets;
    const bIdx = parseInt(bouquetIndex) || 0;
    if (!bouquets[bIdx]) {
        req.flash('error', 'Invalid bouquet');
        return res.redirect('/cart');
    }
    bouquets[bIdx].description = description;
    req.flash('success', 'Bouquet description updated');
    res.redirect('/cart');
});

/**
 * Remove item from cart
 */
router.post('/remove', (req, res) => {
    const { bouquetIndex, itemIndex } = req.body;
    initializeCart(req);
    const bouquets = req.session.cart.bouquets;
    const bIdx = parseInt(bouquetIndex) || 0;
    const iIdx = parseInt(itemIndex);
    if (!bouquets[bIdx] || !bouquets[bIdx].items[iIdx]) {
        req.flash('error', 'Invalid cart item');
        return res.redirect('/cart');
    }
    const removedItem = bouquets[bIdx].items.splice(iIdx, 1)[0];
    req.session.cart.total = calculateCartTotal(bouquets);
    req.flash('success', `${removedItem.name} removed from ${bouquets[bIdx].name}`);
    res.redirect('/cart');
});

/**
 * Remove bouquet and transfer flowers
 */
router.post('/remove-bouquet', (req, res) => {
    const { bouquetIndex } = req.body;
    initializeCart(req);
    const bouquets = req.session.cart.bouquets;
    const bIdx = parseInt(bouquetIndex) || 0;
    
    if (!bouquets[bIdx]) {
        req.flash('error', 'Invalid bouquet');
        return res.redirect('/cart');
    }
    
    if (bouquets.length === 1) {
        // If it's the last bouquet, just clear it
        bouquets[0] = { name: 'Bouquet 1', items: [] };
        req.flash('success', 'Bouquet cleared');
    } else {
        // Transfer flowers to another bouquet
        const flowersToTransfer = bouquets[bIdx].items;
        
        // Remove the bouquet first
        bouquets.splice(bIdx, 1);
        
        // Now transfer flowers to the first remaining bouquet (index 0)
        const targetBouquetIndex = 0;
        
        // Add flowers to target bouquet
        flowersToTransfer.forEach(flower => {
            const existingIndex = bouquets[targetBouquetIndex].items.findIndex(
                item => item.id === flower.id && item.type === flower.type
            );
            if (existingIndex > -1) {
                bouquets[targetBouquetIndex].items[existingIndex].quantity += flower.quantity;
            } else {
                bouquets[targetBouquetIndex].items.push(flower);
            }
        });
        
        // Rename remaining bouquets sequentially
        bouquets.forEach((bouquet, index) => {
            bouquet.name = `Bouquet ${index + 1}`;
        });
        
        req.flash('success', `Bouquet removed. Flowers transferred to ${bouquets[targetBouquetIndex].name}`);
    }
    
    req.session.cart.total = calculateCartTotal(bouquets);
    res.redirect('/cart');
});

/**
 * Clear cart
 */
router.post('/clear', (req, res) => {
    req.session.cart = {
        bouquets: [
            { name: 'Bouquet 1', items: [] }
        ],
        total: 0
    };
    req.flash('success', 'Cart cleared');
    res.redirect('/cart');
});

/**
 * Checkout process
 */
router.post('/checkout', async (req, res) => {
    console.log('Checkout route hit');
    try {
        if (!req.session.cart || !Array.isArray(req.session.cart.bouquets) || req.session.cart.bouquets.every(b => b.items.length === 0)) {
            req.flash('error', 'Cart is empty');
            return res.redirect('/cart');
        }
        const { name, email, address } = req.body;
        // Basic validation
        if (!name || !email || !address) {
            req.flash('error', 'Please fill in all required fields');
            return res.redirect('/cart');
        }
        // Flatten all items from all bouquets
        const allItems = req.session.cart.bouquets.flatMap(b => b.items);
        const userId = (req.session.isLoggedIn && req.session.user && req.session.user.id) ? req.session.user.id : null;
        const orderData = {
            user_id: userId,
            total_amount: req.session.cart.total,
            items: allItems.map(item => ({
                product_id: item.id, // keep as product_id for DB, but it's a flower id
                quantity: item.quantity,
                price: item.price
            }))
        };
        // Create order
        const order = await createOrder(orderData);
        // Clear cart
        req.session.cart = {
            bouquets: [
                { name: 'Bouquet 1', items: [] }
            ],
            total: 0
        };
        req.flash('success', `Order #${order.id} placed successfully!`);
        res.redirect('/orders/confirmation/' + order.id);
    } catch (error) {
        console.error('Error during checkout:', error);
        req.flash('error', 'Error processing order');
        res.redirect('/cart');
    }
});

export default router; 