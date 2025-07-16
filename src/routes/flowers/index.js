import { Router } from 'express';
import db from '../../models/db.js';

const router = Router();

/**
 * /flowers - show all flowers or filter by category
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, display = 'grid' } = req.query;
    
    let query = 'SELECT * FROM flowers';
    let values = [];
    
    if (category) {
      query += ' WHERE category = $1';
      values.push(category);
    }
    
    query += ' ORDER BY name';
    
    const result = await db.query(query, values);
    const flowers = result.rows;
    
    // Get unique categories for filtering
    const categoriesResult = await db.query('SELECT DISTINCT category FROM flowers ORDER BY category');
    const categories = categoriesResult.rows.map(row => row.category);
    
    res.render('flowers', {
      title: category ? `Flowers - ${category}` : 'All Flowers',
      display,
      flowers,
      categories,
      selectedCategory: category,
      hasFlowers: flowers.length > 0
    });
  } catch (err) {
    next(err);
  }
});

/**
 * /flowers/:category - show flowers filtered by category
 */
router.get('/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const { display = 'grid' } = req.query;

    const result = await db.query('SELECT * FROM flowers WHERE category = $1 ORDER BY name', [category]);
    const flowers = result.rows;
    
    if (flowers.length === 0) {
      const error = new Error('Category Not Found');
      error.status = 404;
      return next(error);
    }

    // Get unique categories for filtering
    const categoriesResult = await db.query('SELECT DISTINCT category FROM flowers ORDER BY category');
    const categories = categoriesResult.rows.map(row => row.category);

    res.render('flowers', {
      title: `Flowers - ${category}`,
      display,
      flowers,
      categories,
      selectedCategory: category,
      hasFlowers: flowers.length > 0
    });
  } catch (err) {
    next(err);
  }
});

/**
 * /flowers/:category/:id - show individual flower details
 */
router.get('/:category/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('SELECT * FROM flowers WHERE product_id = $1', [id]);
    const flower = result.rows[0];
    
    if (!flower) {
      const error = new Error('Flower Not Found');
      error.status = 404;
      return next(error);
    }

    res.render('flower-detail', {
      title: flower.name,
      flower
    });
  } catch (err) {
    next(err);
  }
});

export default router;
