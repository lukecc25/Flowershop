import { isAdmin } from '../models/accounts/index.js';

/**
 * Middleware to check if user is logged in
 */
export const requireAuth = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        req.flash('error', 'Please log in to access this page');
        return res.redirect('/accounts/login');
    }
    next();
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        req.flash('error', 'Please log in to access this page');
        return res.redirect('/accounts/login');
    }

    try {
        const isUserAdmin = await isAdmin(req.session.user.id);
        if (!isUserAdmin) {
            req.flash('error', 'Access denied. Admin privileges required.');
            return res.redirect('/accounts/dashboard');
        }
        next();
    } catch (error) {
        console.error('Error checking admin status:', error);
        req.flash('error', 'An error occurred while checking permissions');
        return res.redirect('/accounts/dashboard');
    }
};

/**
 * Middleware to add user role information to res.locals
 */
export const addUserInfo = (req, res, next) => {
    // Check if session exists and user is logged in
    if (req.session && req.session.isLoggedIn && req.session.user) {
        res.locals.currentUser = req.session.user;
        res.locals.isAdmin = req.session.user.role_id === 3;
        res.locals.isLoggedIn = true;
    } else {
        res.locals.currentUser = null;
        res.locals.isAdmin = false;
        res.locals.isLoggedIn = false;
    }
    next();
}; 