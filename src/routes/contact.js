import { Router } from 'express';
import { saveContactMessage, getAllContactMessages, markMessageAsRead, deleteContactMessage } from '../models/contact.js';

const router = Router();

/**
 * Test route to verify contact routes are working
 */
router.get('/test', (req, res) => {
    res.json({ message: 'Contact routes are working!' });
});

/**
 * Root contact route for testing
 */
router.get('/', (req, res) => {
    res.json({ message: 'Contact routes mounted successfully!' });
});

/**
 * Check if contact_messages table exists
 */
router.get('/check-db', async (req, res) => {
    try {
        const db = await import('../models/db.js');
        const result = await db.default.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'contact_messages'
            );
        `);
        res.json({ 
            tableExists: result.rows[0].exists,
            message: result.rows[0].exists ? 'Table exists' : 'Table does not exist'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Handle contact form submission
 */
router.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Basic validation
        if (!name || !email || !subject || !message) {
            req.flash('error', 'All fields are required');
            return res.redirect('/?contact=1');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            req.flash('error', 'Please enter a valid email address');
            return res.redirect('/?contact=1');
        }

        // Save the message
        await saveContactMessage(name, email, subject, message);
        
        req.flash('success', 'Thank you for your message! We will respond as soon as we can.');
        res.redirect('/?contact=1');
    } catch (error) {
        console.error('Error submitting contact form:', error);
        req.flash('error', 'Sorry, there was an error sending your message. Please try again.');
        res.redirect('/?contact=1');
    }
});

/**
 * Admin: View all contact messages
 */
router.get('/admin', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role_name !== 'admin') {
            req.flash('error', 'Access denied. Admin privileges required.');
            return res.redirect('/');
        }

        const messages = await getAllContactMessages();
        res.render('contact/admin', { 
            title: 'Contact Messages',
            messages,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        req.flash('error', 'Error loading contact messages');
        res.redirect('/');
    }
});

/**
 * Admin: Mark message as read
 */
router.post('/admin/read/:id', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role_name !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const messageId = parseInt(req.params.id);
        await markMessageAsRead(messageId);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Admin: Delete message
 */
router.post('/admin/delete/:id', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role_name !== 'admin') {
            req.flash('error', 'Access denied. Admin privileges required.');
            return res.redirect('/contact/admin');
        }

        const messageId = parseInt(req.params.id);
        await deleteContactMessage(messageId);
        
        req.flash('success', 'Message deleted successfully');
        res.redirect('/contact/admin');
    } catch (error) {
        console.error('Error deleting message:', error);
        req.flash('error', 'Error deleting message');
        res.redirect('/contact/admin');
    }
});

export default router; 