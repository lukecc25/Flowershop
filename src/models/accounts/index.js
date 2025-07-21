import db from '../db.js';
import bcrypt from 'bcrypt';
 
const saltRounds = 12;
 
/**
 * Creates a new user account with hashed password
 * @param {Object} userData - Object containing email and password
 * @returns {Object} The created user (without password)
 */
async function createUser(userData) {
    try {
        const { email, password } = userData;
 
        // Hash the password with automatic salt generation
        const hashedPassword = await bcrypt.hash(password, saltRounds);
 
        // If email contains 'admin' (case-insensitive), make admin
        const roleId = email.toLowerCase().includes('admin') ? 3 : 2;
 
        const query = `
            INSERT INTO users (email, password, role_id)
            VALUES ($1, $2, $3)
            RETURNING id, email, role_id, created_at;
        `;
 
        const values = [email, hashedPassword, roleId];
        const result = await db.query(query, values);
 
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error.message);
        throw error;
    }
}
 
/**
 * Finds a user by email address
 * @param {string} email - User's email address
 * @returns {Object|null} User object or null if not found
 */
async function getUserByEmail(email) {
    try {
        const query = `
            SELECT u.id, u.email, u.password, u.role_id, u.created_at, r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1;
        `;
 
        const result = await db.query(query, [email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching user by email:', error.message);
        throw error;
    }
}

/**
 * Gets a user by ID
 * @param {number} userId - User's ID
 * @returns {Object|null} User object or null if not found
 */
async function getUserById(userId) {
    try {
        const query = `
            SELECT u.id, u.email, u.role_id, u.created_at, r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1;
        `;
 
        const result = await db.query(query, [userId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        throw error;
    }
}
 
/**
 * Verifies a user's password against the stored hash
 * @param {string} email - User's email address
 * @param {string} password - Plain text password to verify
 * @returns {Object|null} User object (without password) if authentication succeeds
 */
async function authenticateUser(email, password) {
    try {
        const user = await getUserByEmail(email);
 
        if (!user) {
            // Still perform a hash operation to prevent timing attacks
            await bcrypt.hash(password, saltRounds);
            return null;
        }
 
        const isValid = await bcrypt.compare(password, user.password);
 
        if (isValid) {
            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
 
            // Ensure role_id is an integer
            userWithoutPassword.role_id = parseInt(userWithoutPassword.role_id, 10);
            return userWithoutPassword;
        }
 
        return null;
    } catch (error) {
        console.error('Error authenticating user:', error.message);
        throw error;
    }
}

/**
 * Checks if a user is an admin
 * @param {number} userId - User's ID
 * @returns {boolean} True if user is admin, false otherwise
 */
async function isAdmin(userId) {
    try {
        const user = await getUserById(userId);
        return user && user.role_id === 3; // Admin role_id is 3
    } catch (error) {
        console.error('Error checking admin status:', error.message);
        return false;
    }
}

/**
 * Gets all orders for a specific user
 * @param {number} userId - User's ID
 * @returns {Array} Array of order objects
 */
async function getUserOrders(userId) {
    try {
        const query = `
            SELECT o.id, o.total_amount, o.order_date, o.status,
                   oi.quantity, oi.price_at_time,
                   f.name as flower_name,
                   f.photo as flower_image
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN flowers f ON oi.flower_id = f.flower_id
            WHERE o.user_id = $1
            ORDER BY o.order_date DESC, o.id DESC;
        `;

        const result = await db.query(query, [userId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching user orders:', error.message);
        throw error;
    }
}

/**
 * Creates a new order
 * @param {Object} orderData - Object containing user_id, total_amount, and items
 * @returns {Object} The created order
 */
async function createOrder(orderData) {
    try {
        const { user_id, total_amount, items } = orderData;
        
        // Start a transaction
        const client = await db.connect();
        
        try {
            await client.query('BEGIN');
            
            // Create the order
            const orderQuery = `
                INSERT INTO orders (user_id, total_amount)
                VALUES ($1, $2)
                RETURNING id;
            `;
            const orderResult = await client.query(orderQuery, [user_id, total_amount]);
            const orderId = orderResult.rows[0].id;
            
            // Create order items
            for (const item of items) {
                const itemQuery = `
                    INSERT INTO order_items (order_id, flower_id, quantity, price_at_time)
                    VALUES ($1, $2, $3, $4);
                `;
                await client.query(itemQuery, [orderId, item.flower_id, item.quantity, item.price]);
            }
            
            await client.query('COMMIT');
            
            return { id: orderId, total_amount, user_id };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating order:', error.message);
        throw error;
    }
}
 
/**
 * Checks if an email address is already registered
 * @param {string} email - Email address to check
 * @returns {boolean} True if email exists, false otherwise
 */
async function emailExists(email) {
    try {
        const query = 'SELECT id FROM users WHERE email = $1';
        const result = await db.query(query, [email]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking email existence:', error.message);
        throw error;
    }
}
 
export { 
    createUser, 
    getUserByEmail, 
    getUserById,
    authenticateUser, 
    emailExists, 
    isAdmin, 
    getUserOrders, 
    createOrder 
};