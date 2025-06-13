import db from '../db.js';
 
/**
 * Retrieves all products from the database.
 * Returns an empty array if no products exist yet.
 */
async function getAllProducts() {
    try {
        const query = 'SELECT * FROM products ORDER BY name';
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching products:', error.message);
        throw error;
    }
}
 
/**
 * Retrieves a single product by its ID.
 * Returns null if the product doesn't exist.
 */
async function getProductById(id) {
    try {
        const query = 'SELECT * FROM products WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching product by ID:', error.message);
        throw error;
    }
}
 
/**
 * Adds a new product to the database.
 * Returns the newly created product with its generated ID.
 */
async function addProduct(productData) {
    try {
        const query = `
            INSERT INTO products (name, description, price, image)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [
            productData.name,
            productData.description,
            productData.price,
            productData.image
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding product:', error.message);
        throw error;
    }
}
 
export { getAllProducts, getProductById, addProduct };