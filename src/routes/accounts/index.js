import express from 'express';
import { createUser, authenticateUser, emailExists } from '../../models/accounts/index.js';
import db from '../../models/db.js';
const router = express.Router();

/**
 * Display the login form
 */
router.get('/login', (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/accounts/account');
    }

    res.render('accounts/login', {
        title: 'Login'
    });
});

/**
 * Process login form submission with real authentication
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            req.flash('error', 'Email and password are required');
            return res.render('accounts/login', { title: 'Login' });
        }

        const user = await authenticateUser(email, password);

        if (!user) {
            req.flash('error', 'The email or password is not correct');
            return res.render('accounts/login', { title: 'Login' });
        }

        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.loginTime = new Date();

        req.flash('success', `Welcome back! You have successfully logged in.`);
        res.redirect('/accounts/account');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.render('accounts/login', { title: 'Login' });
    }
});

/**
 * Display the registration form
 */
router.get('/register', (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/accounts/account');
    }

    res.render('accounts/register', {
        title: 'Create Account'
    });
});

/**
 * Process registration form submission
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;
        const errors = [];

        if (!email || !email.includes('@')) {
            errors.push('Valid email address is required');
        }

        if (!password || password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }

        if (email && await emailExists(email)) {
            errors.push('An account with this email already exists');
        }

        if (errors.length > 0) {
            errors.forEach(err => req.flash('error', err));
            return res.render('accounts/register', {
                title: 'Create Account'
            });
        }

        await createUser({ email, password });

        req.flash('success', 'Account created successfully! Please log in with your new credentials.');
        res.redirect('/accounts/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'An error occurred while creating your account. Please try again.');
        res.render('accounts/register', {
            title: 'Create Account'
        });
    }
});

/**
 * Display the combined account page (protected route)
 */
router.get('/account', async (req, res) => {
    if (!req.session.isLoggedIn) {
        req.flash('error', 'Please log in to access your account');
        return res.redirect('/accounts/login');
    }
    const user = req.session.user;
    const loginTime = req.session.loginTime;
    const isAdmin = user && (
        (user.role_id === 3) ||
        user.isAdmin ||
        (user.email && user.email.toLowerCase().includes('admin'))
    );
    let flowers = [];
    if (isAdmin) {
        // Get all flowers for admin
        const { getAllFlowers } = await import('../../models/flowers/index.js');
        flowers = await getAllFlowers();
    }
    res.render('accounts/account', {
        title: 'My Account',
        user,
        loginTime,
        isAdmin,
        flowers
    });
});

/**
 * Process logout request
 */
router.post('/logout', (req, res) => {
    const userEmail = req.session.user?.email;
 
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            req.flash('error', 'Logout failed. Please try again.');
            return res.redirect('/accounts/account');
        }
 
        // Clear the session cookie
        res.clearCookie('sessionId');
 
        // Flash success message and redirect to home
        req.flash('success', `Goodbye! You have been successfully logged out.`);
        res.redirect('/');
    });
});

/**
 * Delete account route
 */
router.post('/delete', async (req, res) => {
    if (!req.session.isLoggedIn || !req.session.user) {
        req.flash('error', 'You must be logged in to delete your account.');
        return res.redirect('/accounts/login');
    }
    try {
        const userId = req.session.user.id;
        // Delete the user
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session after account deletion:', err);
            }
            res.clearCookie('sessionId');
            req.flash('success', 'Your account has been deleted.');
            res.redirect('/');
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        req.flash('error', 'An error occurred while deleting your account.');
        res.redirect('/accounts/account');
    }
});
export default router;
