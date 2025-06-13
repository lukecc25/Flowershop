import db from '../db.js';
 
/**
 * Retrieves all categories that should appear in navigation.
 * These are typically parent categories like "Men's Clothing" and "Women's Clothing".
 */
async function getNavigationCategories() {
    try {
        const query = 'SELECT * FROM categories WHERE show_in_nav = true ORDER BY name';
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching navigation categories:', error.message);
        throw error;
    }
}
 
/**
 * Retrieves a single category by its slug.
 * Slugs are URL-friendly identifiers like "mens" or "womens-shoes".
 */
async function getCategoryBySlug(slug) {
    try {
        const query = 'SELECT * FROM categories WHERE slug = $1';
        const result = await db.query(query, [slug]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching category by slug:', error.message);
        throw error;
    }
}
 
/**
 * Retrieves child categories for a given parent category.
 * This allows us to show subcategories like "Shoes" and "Accessories" 
 * within "Men's Clothing".
 */
async function getChildCategories(parentId) {
    try {
        const query = 'SELECT * FROM categories WHERE parent_id = $1 ORDER BY name';
        const result = await db.query(query, [parentId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching child categories:', error.message);
        throw error;
    }
}
 
/**
 * Mock function for products - returns empty array since we haven't
 * implemented products in the database yet.
 * This prevents the application from crashing while we build database features.
 */
async function getProductsByCategory(categoryId) {
    // TODO: Implement products table and functionality in future assignment
    console.log(`Mock: Getting products for category ID ${categoryId}`);
    return [];
}
 
/**
 * Gets a random navigation category for the products redirect.
 */
async function getRandomNavigationCategory() {
    try {
        const categories = await getNavigationCategories();
        if (categories.length === 0) {
            return null;
        }
        const randomIndex = Math.floor(Math.random() * categories.length);
        return categories[randomIndex];
    } catch (error) {
        console.error('Error getting random category:', error.message);
        throw error;
    }
}
 
export {
    getNavigationCategories,
    getCategoryBySlug,
    getChildCategories,
    getProductsByCategory,
    getRandomNavigationCategory
};