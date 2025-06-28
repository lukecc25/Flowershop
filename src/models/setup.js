import db from './db.js';

const verbose = process.env.NODE_ENV === 'development';

/**
 * SQL to drop the flowers table if it exists
 */
const dropFlowersTable = `
    DROP TABLE IF EXISTS flowers CASCADE;
`;

/**
 * SQL to create the flowers table
 */
const createFlowersTable = `
    CREATE TABLE IF NOT EXISTS flowers (
        product_id INTEGER PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        photo VARCHAR(255) NOT NULL
    );
`;

/**
 * Flower data you provided
 */
const sampleFlowers = [
    {
        product_id: 1,
        name: 'Azalea',
        category: 'Shrubs',
        price: 15.95,
        photo: 'https://cdn.pixabay.com/photo/2018/05/12/19/24/azalea-3394380_1280.jpg'
    },
    {
        product_id: 2,
        name: 'Camellia',
        category: 'Shrubs',
        price: 18.95,
        photo: 'https://cdn.pixabay.com/photo/2022/05/02/21/43/camellia-7170471_1280.jpg'
    },
    {
        product_id: 3,
        name: 'Gardenia',
        category: 'Shrubs',
        price: 19.95,
        photo: 'https://cdn.pixabay.com/photo/2020/04/27/02/41/gardenia-5097886_1280.jpg'
    },
    {
        product_id: 4,
        name: 'Hibiscus',
        category: 'Shrubs',
        price: 25.95,
        photo: 'https://cdn.pixabay.com/photo/2021/11/10/14/25/hibiscus-6784088_1280.jpg'
    },
    {
        product_id: 5,
        name: 'Lantana',
        category: 'Shrubs',
        price: 22.95,
        photo: 'https://cdn.pixabay.com/photo/2023/06/02/23/44/flower-8036709_1280.jpg'
    },
    {
        product_id: 6,
        name: 'Nandina',
        category: 'Shrubs',
        price: 16.95,
        photo: 'https://cdn.pixabay.com/photo/2021/11/09/16/59/nandina-domestica-6781943_1280.jpg'
    },
    {
        product_id: 7,
        name: 'Begonia',
        category: 'Container Plants',
        price: 12.95,
        photo: 'https://cdn.pixabay.com/photo/2017/04/27/04/45/begonia-flower-2264432_1280.jpg'
    },
    {
        product_id: 8,
        name: 'Coleus',
        category: 'Container Plants',
        price: 9.95,
        photo: 'https://cdn.pixabay.com/photo/2023/05/14/23/49/leaves-7993903_1280.jpg'
    },
    {
        product_id: 9,
        name: 'Geranium',
        category: 'Container Plants',
        price: 11.95,
        photo: 'https://cdn.pixabay.com/photo/2016/06/06/12/04/geranium-1439280_1280.jpg'
    },
    {
        product_id: 10,
        name: 'Hydrangea',
        category: 'Herbaceous Perennials',
        price: 8.95,
        photo: 'https://cdn.pixabay.com/photo/2019/04/17/13/55/hydrangea-4134289_1280.jpg'
    }
];

/**
 * SQL to insert flower records
 */
const insertSampleFlowers = `
    INSERT INTO flowers (product_id, name, category, price, photo)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (product_id) DO NOTHING;
`;

/**
 * Main setup function
 */
const setupDatabase = async () => {
    try {
        if (verbose) console.log('Dropping flowers table if it exists...');
        await db.query(dropFlowersTable);

        if (verbose) console.log('Creating flowers table...');
        await db.query(createFlowersTable);

        if (verbose) console.log('Inserting flower data...');
        for (const flower of sampleFlowers) {
            await db.query(insertSampleFlowers, [
                flower.product_id,
                flower.name,
                flower.category,
                flower.price,
                flower.photo
            ]);
        }

        if (verbose) console.log('Flower table setup complete!');
        return true;
    } catch (error) {
        console.error('Error setting up flower table:', error.message);
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
