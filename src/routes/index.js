import { Router } from 'express';

const router = Router();

// Sample product data
const products = [
  {
    id: 1,
    name: "Azalea",
    description: "Large double. Good grower, heavy bloomer. Dark green foliage.",
    price: 15.95,
    image: "https://cdn.pixabay.com/photo/2018/05/12/19/24/azalea-3394380_1280.jpg"
  },
  {
    id: 2,
    name: "Camellia",
    description: "Medium single. Early bloomer. Upright growth with bronze-green foliage.",
    price: 18.95,
    image: "https://cdn.pixabay.com/photo/2022/05/02/21/43/camellia-7170471_1280.jpg"
  },
  {
    id: 3,
    name: "Gardenia",
    description: "Fragrant white blossoms. Large glossy green leaves.",
    price: 19.95,
    image: "https://cdn.pixabay.com/photo/2020/04/27/02/41/gardenia-5097886_1280.jpg"
  },
  {
    id: 4,
    name: "Hibiscus",
    description: "Showy pink flowers. Great for hedges. Fast growing.",
    price: 25.95,
    image: "https://cdn.pixabay.com/photo/2021/11/10/14/25/hibiscus-6784088_1280.jpg"
  },
  {
    id: 5,
    name: "Lantana",
    description: "Clusters of small purple flowers. Drought tolerant once established.",
    price: 22.95,
    image: "https://cdn.pixabay.com/photo/2023/06/02/23/44/flower-8036709_1280.jpg"
  },
  {
    id: 6,
    name: "Nandina",
    description: "Low-growing evergreen. Red berries in fall. White flowers in spring.",
    price: 16.95,
    image: "https://cdn.pixabay.com/photo/2021/11/09/16/59/nandina-domestica-6781943_1280.jpg"
  },
  {
    id: 7,
    name: "Begonia",
    description: "Bright pink blossoms. Prefers shade. Keep soil moist.",
    price: 12.95,
    image: "https://cdn.pixabay.com/photo/2017/04/27/04/45/begonia-flower-2264432_1280.jpg"
  },
  {
    id: 8,
    name: "Coleus",
    description: "Colorful foliage. Water regularly. Avoid direct sunlight.",
    price: 9.95,
    image: "https://pixabay.com/photos/plant-leaves-coleus-flora-botany-8154172/"
  },
  {
    id: 9,
    name: "Geranium",
    description: "Easy to grow. Needs bright light. Allow soil to dry between watering.",
    price: 11.95,
    image: "https://cdn.pixabay.com/photo/2016/06/06/12/04/geranium-1439280_1280.jpg"
  },
  {
    id: 10,
    name: "Hydrangea",
    description: "Large blue blooms. Prefers shade and moist soil.",
    price: 8.95,
    image: "https://cdn.pixabay.com/photo/2019/04/17/13/55/hydrangea-4134289_1280.jpg"
  }
];


// Middleware to validate display parameter
const validateDisplayMode = (req, res, next) => {
    const { display } = req.params;
    if (display !== 'grid' && display !== 'details') {
        const error = new Error('Invalid display mode: must be either "grid" or "details".');
        return next(error); // return here to avoid calling next() twice
    }
    next(); // valid mode, continue
};

// Home page route
router.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

// About page route  
router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

// Default products route (redirects to grid view)
router.get('/products', (req, res) => {
    res.redirect('/products/grid');
});

// Products page route with display mode validation
router.get('/products/:display', validateDisplayMode, (req, res) => {
    const title = "Our Products";
    const { display } = req.params;
    res.render('products', { title, products, display });
});

// Error handling middleware (must come after all routes)
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: err.message, 
        error: process.env.NODE_ENV === 'development' ? err : {} 
    });
});

export default router;
