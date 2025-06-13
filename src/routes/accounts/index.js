import express from 'express';
import { createUser, authenticateUser, emailExists } from '../../models/accounts/index.js';
const router = express.Router();

/**
 * Display the login form
 */
router.get('/login', (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/accounts/dashboard');
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
            req.flash('error', 'Invalid email or password');
            return res.render('accounts/login', { title: 'Login' });
        }

        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.loginTime = new Date();

        req.flash('success', `Welcome back! You have successfully logged in.`);
        res.redirect('/accounts/dashboard');
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
        return res.redirect('/accounts/dashboard');
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
 * Display the user dashboard (protected route)
 */
router.get('/dashboard', (req, res) => {
    if (!req.session.isLoggedIn) {
        req.flash('error', 'Please log in to access the dashboard');
        return res.redirect('/accounts/login');
    }

    res.render('accounts/dashboard', {
        title: 'Account Dashboard',
        user: req.session.user,
        loginTime: req.session.loginTime
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
            return res.redirect('/accounts/dashboard');
        }
 
        // Clear the session cookie
        res.clearCookie('sessionId');
 
        // Flash success message and redirect to home
        req.flash('success', `Goodbye! You have been successfully logged out.`);
        res.redirect('/');
    });
});
export default router;
