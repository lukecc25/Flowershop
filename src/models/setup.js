import db from './db.js';

const verbose = process.env.NODE_ENV === 'development';


/**
 * SQL to create the roles table
 */
const createRolesTable = `
    CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT
    );
`;

/**
 * SQL to create the users table
 */
const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role_id INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id)
    );
`;

/**
 * SQL to create the orders table
 */
const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        total_amount DECIMAL(10,2) NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
`;

/**
 * SQL to create the order_items table (now references flower_id)
 */
const createOrderItemsTable = `
    CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        flower_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        price_at_time DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (flower_id) REFERENCES flowers(flower_id) ON DELETE CASCADE
    );
`;

/**
 * SQL to create the contact_messages table
 */
const createContactMessagesTable = `
    CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE
    );
`;

// NOTE: If you are running this on an existing database, a migration is required to rename product_id to flower_id in the flowers table and update all foreign keys referencing it.

/**
 * SQL to create the flowers table (existing)
 */
const createFlowersTable = `
    CREATE TABLE IF NOT EXISTS flowers (
        flower_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        photo VARCHAR(255) NOT NULL
    );
`;

/**
 * Sample roles data
 */
const sampleRoles = [
    { id: 1, role_name: 'guest', description: 'Non-registered users' },
    { id: 2, role_name: 'user', description: 'Registered users' },
    { id: 3, role_name: 'admin', description: 'Administrators' }
];

/**
 * Sample admin user
 */
const adminUser = {
    email: 'admin@flowershop.com',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5wK6i', // 'admin123'
    role_id: 3
};

/**
 * Flower data (existing)
 */
const sampleFlowers = [
    {
        flower_id: 1,
        name: 'Azalea',
        category: 'Shrubs',
        price: 15.95,
        photo: 'https://cdn.pixabay.com/photo/2018/05/12/19/24/azalea-3394380_1280.jpg'
    },
    {
        flower_id: 2,
        name: 'Camellia',
        category: 'Shrubs',
        price: 18.95,
        photo: 'https://cdn.pixabay.com/photo/2022/05/02/21/43/camellia-7170471_1280.jpg'
    },
    {
        flower_id: 3,
        name: 'Gardenia',
        category: 'Shrubs',
        price: 19.95,
        photo: 'https://cdn.pixabay.com/photo/2020/04/27/02/41/gardenia-5097886_1280.jpg'
    },
    {
        flower_id: 4,
        name: 'Hibiscus',
        category: 'Shrubs',
        price: 25.95,
        photo: 'https://cdn.pixabay.com/photo/2021/11/10/14/25/hibiscus-6784088_1280.jpg'
    },
    {
        flower_id: 5,
        name: 'Lantana',
        category: 'Shrubs',
        price: 22.95,
        photo: 'https://cdn.pixabay.com/photo/2023/06/02/23/44/flower-8036709_1280.jpg'
    },
    {
        flower_id: 6,
        name: 'Nandina',
        category: 'Shrubs',
        price: 16.95,
        photo: 'https://cdn.pixabay.com/photo/2021/11/09/16/59/nandina-domestica-6781943_1280.jpg'
    },
    {
        flower_id: 7,
        name: 'Begonia',
        category: 'Container Plants',
        price: 12.95,
        photo: 'https://cdn.pixabay.com/photo/2017/04/27/04/45/begonia-flower-2264432_1280.jpg'
    },
    {
        flower_id: 8,
        name: 'Coleus',
        category: 'Container Plants',
        price: 9.95,
        photo: 'https://cdn.pixabay.com/photo/2023/05/14/23/49/leaves-7993903_1280.jpg'
    },
    {
        flower_id: 9,
        name: 'Geranium',
        category: 'Container Plants',
        price: 11.95,
        photo: 'https://cdn.pixabay.com/photo/2016/06/06/12/04/geranium-1439280_1280.jpg'
    },
    {
        flower_id: 10,
        name: 'Hydrangea',
        category: 'Herbaceous Perennials',
        price: 8.95,
        photo: 'https://cdn.pixabay.com/photo/2019/04/17/13/55/hydrangea-4134289_1280.jpg'
    }
];

/**
 * SQL to insert roles
 */
const insertRoles = `
    INSERT INTO roles (id, role_name, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (id) DO NOTHING;
`;

/**
 * SQL to insert admin user
 */
const insertAdminUser = `
    INSERT INTO users (email, password, role_id)
    VALUES ($1, $2, $3)
    ON CONFLICT (email) DO NOTHING;
`;

/**
 * SQL to insert flower records
 */
const insertSampleFlowers = `
    INSERT INTO flowers (flower_id, name, category, price, photo)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (flower_id) DO NOTHING;
`;

/**
 * Main setup function
 */
const setupDatabase = async () => {
    try {
        if (verbose) console.log('Creating roles table...');
        await db.query(createRolesTable);

        if (verbose) console.log('Creating users table...');
        await db.query(createUsersTable);

        if (verbose) console.log('Creating orders table...');
        await db.query(createOrdersTable);

        if (verbose) console.log('Creating flowers table...');
        await db.query(createFlowersTable);

        if (verbose) console.log('Creating order_items table...');
        await db.query(createOrderItemsTable);

        if (verbose) console.log('Creating contact_messages table...');
        await db.query(createContactMessagesTable);

        if (verbose) console.log('Inserting roles...');
        for (const role of sampleRoles) {
            await db.query(insertRoles, [role.id, role.role_name, role.description]);
        }

        if (verbose) console.log('Inserting admin user...');
        await db.query(insertAdminUser, [adminUser.email, adminUser.password, adminUser.role_id]);

        if (verbose) console.log('Inserting flower data...');
        for (const flower of sampleFlowers) {
            await db.query(insertSampleFlowers, [
                flower.flower_id,
                flower.name,
                flower.category,
                flower.price,
                flower.photo
            ]);
        }

        if (verbose) console.log('Database setup complete!');
        return true;
    } catch (error) {
        console.error('Error setting up database:', error.message);
        throw error;
    }
};

/**
 * Test connection utility
 */
const testConnection = async () => {
    try {
        const result = await db.query('SELECT NOW() AS current_time');
        console.log('Database connection successful:', result.rows[0].current_time);
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
};

export { setupDatabase, testConnection };
