import flashMessages from './src/middleware/flash.js';
import dashboardRoutes from './src/routes/dashboard/index.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupDatabase, testConnection } from './src/models/setup.js';
import db from './src/models/db.js';
import session from 'express-session';
import pgSession from 'connect-pg-simple';

// Import route handlers from their new locations
import indexRoutes from './src/routes/index.js';
import testRoutes from './src/routes/test.js';
import accountRoutes from './src/routes/accounts/index.js';
import flowersRoutes from './src/routes/flowers.js';
import cartRoutes from './src/routes/cart.js';
import ordersRoutes from './src/routes/orders.js';
import contactRoutes from './src/routes/contact.js';

// Import global middleware
import {
    addGlobalData,
    addTimestamp,
    poweredByHeader,
    measureProcessingTime,
} from './src/middleware/index.js';
import { addUserInfo } from './src/middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;

const app = express();

// Static files
app.use(express.static(path.join(__dirname, 'public')));
// Middleware to parse JSON data in request body
app.use(express.json());
// Middleware to parse URL-encoded form data (like from a standard HTML form)
app.use(express.urlencoded({ extended: true }));
// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Global middleware
app.use(addGlobalData);
app.use(addTimestamp);
app.use(poweredByHeader);
app.use(measureProcessingTime);


// Initialize res.locals defaults
app.use((req, res, next) => {
    res.locals.errors = [];
    res.locals.messages = [];
    next();
});

/**
 * Configure PostgreSQL session store
 */
const PostgresStore = pgSession(session);

// Session middleware - must come before flashMessages
app.use(session({
    store: new PostgresStore({
        pool: db, // Use your PostgreSQL connection pool
        tableName: 'sessions',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || "default-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
        secure: false, // Set true if using HTTPS in production
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
}));

// Flash message middleware - after session, before routes
app.use(flashMessages);

// Add user info middleware - after session and flash
app.use(addUserInfo);

/**
 * Routes
 */
app.use('/', indexRoutes);
app.use('/flowers', flowersRoutes);
app.use('/test', testRoutes);
app.use('/accounts', accountRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/contact', contactRoutes);

// Manual error test route
app.get('/manual-error', (req, res, next) => {
    const err = new Error('This is a manually triggered error');
    err.status = 500;
    next(err);
});

// Database test route
app.get('/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW() as current_time');
        res.json({ 
            success: true, 
            time: result.rows[0].current_time,
            message: 'Database connection working'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * Error Handling Middleware
 */

// 404 Handler (optional, if you want to handle 404 specifically)
app.use((req, res, next) => {
    res.status(404);
    const context = {
        title: 'Page Not Found',
        error: 'Sorry, the page you requested does not exist.',
        NODE_ENV,
        PORT,
        isLoggedIn: res.locals.isLoggedIn || false,
        isAdmin: res.locals.isAdmin || false,
        currentUser: res.locals.currentUser || null
    };
    res.render('errors/404', context);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Internal Server Error',
        error: err.message,
        stack: NODE_ENV === 'production' ? '' : err.stack,
        NODE_ENV,
        PORT,
        isLoggedIn: res.locals.isLoggedIn || false,
        isAdmin: res.locals.isAdmin || false,
        currentUser: res.locals.currentUser || null
    };
    res.status(status).render(`errors/${status === 404 ? '404' : '500'}`, context);
});

/**
 * WebSocket Dev Server (Live Reloading)
 */
if (NODE_ENV.includes('dev')) {
    const ws = await import('ws');
    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });

        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });

        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}

// Start server
app.listen(PORT, async () => {
    try {
        await testConnection();
        console.log('Database connection successful');
        
        try {
        await setupDatabase();
            console.log('Database setup completed successfully');
        } catch (setupError) {
            console.error('Database setup failed:', setupError.message);
            console.log('Server will start without database setup');
        }
    } catch (error) {
        console.error('Database connection failed:', error.message);
        console.log('Server will start without database connection');
    }
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
