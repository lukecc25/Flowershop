// Sample data for explore functionality
const exploreData = {
    categories: {
        mens: {
            name: "Men's Clothing",
            description: "Explore our collection of men's fashion",
            items: {
                123: {
                    name: 'Classic T-Shirt',
                    price: 29.99,
                    description: 'A timeless essential for every wardrobe. Made from 100% organic cotton with a comfortable regular fit. Perfect for casual outings or layering under jackets.',
                    image: 'https://picsum.photos/400/600?random=1'
                },
                124: {
                    name: 'Denim Jeans',
                    price: 89.99,
                    description: 'Premium quality straight-leg denim jeans. Features a classic five-pocket design with durable brass hardware. Crafted from stretch denim for all-day comfort.',
                    image: 'https://picsum.photos/400/600?random=2'
                },
                125: {
                    name: 'Leather Jacket',
                    price: 299.99,
                    description: 'Genuine leather motorcycle jacket with asymmetrical zipper. Quilted lining provides warmth while multiple pockets offer functionality. A statement piece that never goes out of style.',
                    image: 'https://picsum.photos/400/600?random=3'
                },
                126: {
                    name: 'Oxford Shirt',
                    price: 69.99,
                    description: 'Classic button-down Oxford shirt in crisp white. Features a tailored fit with mother-of-pearl buttons. Perfect for business meetings or smart casual occasions.',
                    image: 'https://picsum.photos/400/600?random=4'
                },
                127: {
                    name: 'Chino Shorts',
                    price: 49.99,
                    description: 'Lightweight cotton chino shorts with a 9-inch inseam. Features slash pockets and button-through back pockets. Ideal for summer days and vacation wear.',
                    image: 'https://picsum.photos/400/600?random=5'
                }
            }
        },
        womens: {
            name: "Women's Clothing",
            description: "Discover our women's fashion line",
            items: {
                231: {
                    name: 'Summer Dress',
                    price: 59.99,
                    description: 'Flowing midi dress in a vibrant floral print. Features adjustable spaghetti straps and a flattering A-line silhouette. Perfect for garden parties and beach holidays.',
                    image: 'https://picsum.photos/400/600?random=6'
                },
                232: {
                    name: 'Silk Blouse',
                    price: 79.99,
                    description: 'Elegant silk blouse with delicate button detailing. Features a relaxed fit with French cuffs. Pairs beautifully with tailored pants or skirts for a sophisticated look.',
                    image: 'https://picsum.photos/400/600?random=7'
                },
                233: {
                    name: 'High Heels',
                    price: 99.99,
                    description: 'Classic pointed-toe pumps with a 4-inch heel. Crafted from genuine suede with a cushioned footbed. The perfect finishing touch to any evening outfit.',
                    image: 'https://picsum.photos/400/600?random=8'
                },
                234: {
                    name: 'Denim Skirt',
                    price: 54.99,
                    description: 'Versatile A-line denim skirt with front button closure. Features functional pockets and hits just above the knee. A modern take on a classic wardrobe staple.',
                    image: 'https://picsum.photos/400/600?random=9'
                },
                235: {
                    name: 'Cashmere Sweater',
                    price: 149.99,
                    description: 'Luxurious 100% cashmere crew neck sweater. Features ribbed cuffs and hem with a relaxed fit. Incredibly soft and perfect for transitional weather.',
                    image: 'https://picsum.photos/400/600?random=10'
                }
            }
        },
        accessories: {
            name: 'Accessories',
            description: 'Complete your look with our accessories',
            items: {
                331: {
                    name: 'Leather Belt',
                    price: 39.99,
                    description: 'Full-grain leather belt with brushed silver buckle. Features a reversible design with black on one side and brown on the other. A versatile accessory for any wardrobe.',
                    image: 'https://picsum.photos/400/600?random=11'
                },
                332: {
                    name: 'Aviator Sunglasses',
                    price: 79.99,
                    description: 'Classic aviator sunglasses with polarized lenses. Gold-tone metal frame with adjustable nose pads. Provides 100% UV protection while adding timeless style.',
                    image: 'https://picsum.photos/400/600?random=12'
                },
                333: {
                    name: 'Chronograph Watch',
                    price: 199.99,
                    description: 'Stainless steel chronograph watch with leather strap. Features date display and water resistance to 50 meters. A sophisticated timepiece for the modern professional.',
                    image: 'https://picsum.photos/400/600?random=13'
                },
                334: {
                    name: 'Canvas Tote',
                    price: 44.99,
                    description: 'Durable canvas tote bag with leather handles. Features an interior zipper pocket and reinforced bottom. Perfect for daily essentials or weekend shopping.',
                    image: 'https://picsum.photos/400/600?random=14'
                },
                335: {
                    name: 'Knit Scarf',
                    price: 34.99,
                    description: 'Soft merino wool scarf in a classic cable knit pattern. Measures 70 inches long for versatile styling. Adds warmth and texture to any winter outfit.',
                    image: 'https://picsum.photos/400/600?random=15'
                }
            }
        },
        shoes: {
            name: 'Footwear',
            description: 'Step out in style with our footwear collection',
            items: {
                441: {
                    name: 'Canvas Sneakers',
                    price: 64.99,
                    description: 'Classic low-top canvas sneakers with vulcanized rubber sole. Features cushioned insole and reinforced toe cap. A timeless design that pairs with any casual outfit.',
                    image: 'https://picsum.photos/400/600?random=16'
                },
                442: {
                    name: 'Chelsea Boots',
                    price: 159.99,
                    description: 'Sleek leather Chelsea boots with elastic side panels. Features a durable rubber sole and pull tabs for easy wearing. Perfect for both formal and casual occasions.',
                    image: 'https://picsum.photos/400/600?random=17'
                },
                443: {
                    name: 'Running Shoes',
                    price: 119.99,
                    description: 'High-performance running shoes with responsive cushioning. Features breathable mesh upper and rubber outsole for traction. Designed for comfort during long runs.',
                    image: 'https://picsum.photos/400/600?random=18'
                },
                444: {
                    name: 'Loafers',
                    price: 89.99,
                    description: 'Classic penny loafers in polished leather. Features traditional moccasin construction with leather sole. A refined choice for business casual attire.',
                    image: 'https://picsum.photos/400/600?random=19'
                },
                445: {
                    name: 'Sandals',
                    price: 49.99,
                    description: 'Comfortable leather sandals with adjustable straps. Features contoured footbed and non-slip sole. Perfect for summer adventures and beach vacations.',
                    image: 'https://picsum.photos/400/600?random=20'
                }
            }
        }
    }
};

// Get all categories
export const getAllCategories = async() => Promise.resolve(exploreData.categories);

// Get category data
export const getCategory = async(categoryId) => {
    // Simulate async database call
    return Promise.resolve(exploreData.categories[categoryId] || null);
};

// Get all products in a category
export const getCategoryItems = async(categoryId) => {
    const category = await getCategory(categoryId);
    return category ? category.items : null;
};

// Get item data
export const getItem = async(categoryId, itemId) => {
    const category = await getCategory(categoryId);
    return category ? category.items[itemId] || null : null;
};

// Get a random product
export const getRandomProduct = async() => {
    const categories = Object.keys(exploreData.categories);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const category = exploreData.categories[randomCategory];
    const itemIds = Object.keys(category.items);
    const randomItemId = itemIds[Math.floor(Math.random() * itemIds.length)];

    return {
        category: randomCategory,
        id: randomItemId
    };
};
