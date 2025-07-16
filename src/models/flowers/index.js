import db from '../db.js';

/**
 * Retrieves all flowers from the database.
 */
async function getAllFlowers() {
    try {
        const query = 'SELECT * FROM flowers ORDER BY name';
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching flowers:', error.message);
        throw error;
    }
}

/**
 * Gets flowers by category
 */
async function getFlowersByCategory(category) {
    try {
        const query = 'SELECT * FROM flowers WHERE category = $1 ORDER BY name';
        const result = await db.query(query, [category]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching flowers by category:', error.message);
        throw error;
    }
}

/**
 * Gets all unique categories
 */
async function getCategories() {
    try {
        const query = 'SELECT DISTINCT category FROM flowers ORDER BY category';
        const result = await db.query(query);
        return result.rows.map(row => row.category);
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        throw error;
    }
}

/**
 * Gets a flower by ID
 */
async function getFlowerById(id) {
    try {
        const query = 'SELECT * FROM flowers WHERE flower_id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching flower by ID:', error.message);
        throw error;
    }
}

/**
 * Adds a new flower to the database.
 */
async function addFlower(flowerData) {
    try {
        const query = `
            INSERT INTO flowers (name, category, price, photo)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [
            flowerData.name,
            flowerData.category,
            flowerData.price,
            flowerData.photo
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding flower:', error.message);
        throw error;
    }
}

export {
    getAllFlowers,
    getFlowersByCategory,
    getCategories,
    getFlowerById,
    addFlower
}; 