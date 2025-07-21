import db from './db.js';

/**
 * Save a new contact message
 */
export const saveContactMessage = async (name, email, subject, message) => {
    try {
        const query = `
            INSERT INTO contact_messages (name, email, subject, message)
            VALUES ($1, $2, $3, $4)
            RETURNING id, created_at
        `;
        const result = await db.query(query, [name, email, subject, message]);
        return result.rows[0];
    } catch (error) {
        console.error('Error saving contact message:', error);
        throw error;
    }
};

/**
 * Get all contact messages (for admin)
 */
export const getAllContactMessages = async () => {
    try {
        const query = `
            SELECT id, name, email, subject, message, created_at, is_read
            FROM contact_messages
            ORDER BY created_at DESC
        `;
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        throw error;
    }
};

/**
 * Mark a contact message as read
 */
export const markMessageAsRead = async (messageId) => {
    try {
        const query = `
            UPDATE contact_messages
            SET is_read = TRUE
            WHERE id = $1
            RETURNING id
        `;
        const result = await db.query(query, [messageId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error marking message as read:', error);
        throw error;
    }
};

/**
 * Delete a contact message
 */
export const deleteContactMessage = async (messageId) => {
    try {
        const query = `
            DELETE FROM contact_messages
            WHERE id = $1
            RETURNING id
        `;
        const result = await db.query(query, [messageId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting contact message:', error);
        throw error;
    }
};

/**
 * Get unread message count
 */
export const getUnreadMessageCount = async () => {
    try {
        const query = `
            SELECT COUNT(*) as count
            FROM contact_messages
            WHERE is_read = FALSE
        `;
        const result = await db.query(query);
        return parseInt(result.rows[0].count);
    } catch (error) {
        console.error('Error getting unread message count:', error);
        throw error;
    }
}; 