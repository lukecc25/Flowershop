import { Router } from 'express';
import {
  getNavigationCategories,
  getCategoryBySlug,
  getChildCategories,
  getProductsByCategory,
  getRandomNavigationCategory
} from '../../models/categories/index.js';

const router = Router();

/**
 * /products - redirect to a random parent category.
 */
router.get('/', async (req, res, next) => {
  try {
    const randomCategory = await getRandomNavigationCategory();

    if (!randomCategory) {
      const error = new Error('No categories available');
      error.status = 404;
      return next(error);
    }

    res.redirect(`/products/${randomCategory.slug}`);
  } catch (err) {
    next(err);
  }
});

/**
 * /products/:category - show a category and its subcategories/products.
 */
router.get('/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const { display = 'grid' } = req.query;

    const categoryData = await getCategoryBySlug(category);
    if (!categoryData) {
      const error = new Error('Category Not Found');
      error.status = 404;
      return next(error);
    }

    const subcategories = await getChildCategories(categoryData.id);
    const products = await getProductsByCategory(categoryData.id);

    res.render('products', {
      title: `Exploring ${categoryData.name}`,
      display,
      categoryData,
      subcategories,
      products,
      hasProducts: products.length > 0,
      hasSubcategories: subcategories.length > 0
    });
  } catch (err) {
    next(err);
  }
});

/**
 * /products/:category/:id - redirect to category view.
 * This is useful if someone tries to go directly to a product without a details page.
 */
router.get('/:category/:id', (req, res) => {
  const { category } = req.params;
  res.redirect(`/products/${category}`);
});

export default router;
