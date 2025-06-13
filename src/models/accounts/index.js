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
 
        const query = `
            INSERT INTO users (email, password, role_id)
            VALUES ($1, $2, $3)
            RETURNING id, email, role_id, created_at;
        `;
 
        const values = [email, hashedPassword, 0]; // Default role is 0 (user)
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
 
export { createUser, getUserByEmail, authenticateUser, emailExists };