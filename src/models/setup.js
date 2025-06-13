import db from './db.js';
const verbose = process.env.NODE_ENV === 'development';

/**
 * SQL to create the categories table if it doesn't exist.
 */
const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        parent_id INTEGER REFERENCES categories(id),
        show_in_nav BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

/**
 * SQL to create the products table if it doesn't exist.
 */
const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image VARCHAR(500) NOT NULL
    );
`;

/**
 * SQL to create the roles table.
 */
const createRolesTable = `
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);
`;

/**
 * SQL to insert default roles.
 */
const insertDefaultRoles = `
INSERT INTO roles (id, role_name) VALUES 
    (0, 'user'),
    (1, 'employee'), 
    (2, 'management')
ON CONFLICT (id) DO NOTHING;
`;

/**
 * SQL to create the users table.
 */
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER DEFAULT 0 REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Initial categories
const initialCategories = [
    {
        name: "Men's Clothing",
        slug: "mens",
        description: "Explore our collection of men's fashion and apparel",
        parent_id: null,
        show_in_nav: true
    },
    {
        name: "Women's Clothing", 
        slug: "womens",
        description: "Discover our women's fashion line and accessories",
        parent_id: null,
        show_in_nav: true
    },
    {
        name: "Footwear",
        slug: "shoes", 
        description: "Men's shoes and footwear",
        parent_id: 1,
        show_in_nav: false
    },
    {
        name: "Accessories",
        slug: "accessories",
        description: "Men's accessories and extras",
        parent_id: 1,
        show_in_nav: false
    },
    {
        name: "Footwear",
        slug: "womens-shoes", 
        description: "Women's shoes and footwear",
        parent_id: 2,
        show_in_nav: false
    },
    {
        name: "Accessories",
        slug: "womens-accessories",
        description: "Women's accessories and extras", 
        parent_id: 2,
        show_in_nav: false
    }
];

const insertCategory = async (category, verbose = true) => {
    const query = `
        INSERT INTO categories (name, slug, description, parent_id, show_in_nav)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id, name, slug;
    `;
    const values = [category.name, category.slug, category.description, category.parent_id, category.show_in_nav];
    const result = await db.query(query, values);

    if (result.rows.length > 0 && verbose) {
        console.log(`Created category: ${result.rows[0].name}`);
    } else if (verbose) {
        console.log(`Category already exists, skipping: ${category.name}`);
    }
};

const setupDatabase = async () => {
    const verbose = process.env.DISABLE_SQL_LOGGING !== 'true';

    try {
        if (verbose) console.log('Setting up database...');

        // Create the categories table
        await db.query(createCategoriesTable);
        if (verbose) console.log('Categories table ready');

        // Create the products table
        await db.query(createProductsTable);
        if (verbose) console.log('Products table ready');

        // Create the roles table
        await db.query(createRolesTable);
        if (verbose) console.log('Roles table ready');

        // Insert default roles
        await db.query(insertDefaultRoles);
        if (verbose) console.log('Default roles inserted');

        // Create the users table
        await db.query(createUsersTable);
        if (verbose) console.log('Users table ready');

        // Insert initial categories
        for (const category of initialCategories) {
            await insertCategory(category, verbose);
        }

        if (verbose) console.log('Database setup complete');
        return true;
    } catch (error) {
        console.error('Error setting up database:', error.message);
        throw error;
    }
};


const testConnection = async () => {
    try {
        const result = await db.query('SELECT NOW() as current_time');
        console.log('Database connection successful:', result.rows[0].current_time);
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
};

export { setupDatabase, testConnection };
