import { Hono } from 'hono';

const JWT_SECRET = 'hyprstock';
const GOOGLE_CLIENT_ID = '743387480609-d2rumtr8se393tlhfau8fcnhcpt61phn.apps.googleusercontent.com';

const app = new Hono();
app.use('*', async (c, next) => {
  // Add CORS headers
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  c.header('Access-Control-Max-Age', '86400');

  // Handle OPTIONS request
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }

  await next();
});
// Utility: Generate JWT
async function generateJWT(payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));

  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${data}.${encodedSignature}`;
}

// Utility: Verify JWT
async function verifyJWT(token) {
  const [header, payload, signature] = token.split('.');
  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const expectedSignature = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));

  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    expectedSignature,
    new TextEncoder().encode(data)
  );

  if (!valid) throw new Error('Invalid JWT');
  return JSON.parse(atob(payload));
}

// Middleware: JWT Authentication
async function jwtMiddleware(c, next) {
  const authHeader = c.req.raw.headers.get('authorization'); 
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7); // Remove "Bearer "
  try {
    const userData = await verifyJWT(token);
    c.req.user = userData; // Attach user data (including role) to request
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
}

// Middleware: Admin Check
async function adminMiddleware(c, next) {
  if (!c.req.user || c.req.user.role !== 'admin') {
    return c.json({ error: 'Forbidden: Admins only' }, 403);
  }

  await next();
}

// Utility: Execute D1 Query
async function executeQuery(c, query, params = []) {
  const result = await c.env.DB.prepare(query).bind(...params).all();
  return result;
}

// Route: Google Authentication and JWT generation
app.post('/auth/google', async (c) => {
  const { googleToken } = await c.req.json();

  // Verify Google token
  const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
  const userData = await googleResponse.json();
  if (userData.aud !== GOOGLE_CLIENT_ID) {
    return c.json({ error: 'Invalid Google token' }, 401);
  }

  const { name, email, picture } = userData;

  // Check if user exists in D1
  let result = await executeQuery(c, `SELECT * FROM users WHERE email = ?`, [email]);
  let user;
  if (result.results.length === 0) {
    // User does not exist, create new user with default role 'customer'
    result = await executeQuery(c, `
      INSERT INTO users (google_id, username, email, role, created_at, updated_at)
      VALUES (?, ?, ?, 'customer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `, [userData.sub, name, email]);
    user = result.results[0];
  } else {
    user = result.results[0];
  }

  // Generate a token that includes the user's ID and role
  const token = await generateJWT({ userId: user.user_id, role: user.role });

  return c.json({ token, user });
});

// Route: Get User Data (protected)
app.get('/api/user', jwtMiddleware, async (c) => {
  const userId = c.req.user.userId; // Access user data from request

  // Fetch user data from D1
  const result = await executeQuery(c, `SELECT * FROM users WHERE user_id = ?`, [userId]);
  if (result.results.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(result.results[0]);
});

// Route: Get All Users (Admin only)
app.get('/api/admin/users', jwtMiddleware, adminMiddleware, async (c) => {
  const result = await executeQuery(c, 'SELECT * FROM users');
  const users = result.results;

  return c.json(users); // Return the list of users
});

// Route: Update User Data (protected)
app.put('/api/user', jwtMiddleware, async (c) => {
  const userId = c.req.user.userId; // Access user data from the JWT
  const updates = await c.req.json(); // Data for updating

  // Prepare update fields
  const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const updateValues = Object.values(updates);

  // Update the user data in D1
  const result = await executeQuery(c, `
    UPDATE users
    SET ${updateFields}
    WHERE user_id = ?
    RETURNING *;
  `, [...updateValues, userId]);

  if (result.results.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(result.results[0]);
});

// Route: Create a Product (protected)
app.post('/api/products', jwtMiddleware, async (c) => {
  try {
    const { product_name, description, price, quantity_in_stock } = await c.req.json();
    const userId = c.req.user.userId; // Extract userId from the JWT payload

    // Validate the user exists
    const userResult = await executeQuery(c, 
      'SELECT * FROM users WHERE user_id = ?', 
      [userId]
    );

    if (userResult.results.length === 0) {
      return c.json({ 
        error: 'User not found' 
      }, 404);
    }

    // Validate required fields
    if (!product_name || !description || !price) {
      return c.json({ 
        error: 'Missing required fields: product_name, description, and price are required' 
      }, 400);
    }

    // Insert the new product into D1, associating it with the correct user
    const result = await executeQuery(c, `
      INSERT INTO products (
        product_name, 
        description, 
        price, 
        quantity_in_stock,
        user_id, 
        created_at, 
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `, [
      product_name, 
      description, 
      price, 
      quantity_in_stock || 0, // Default to 0 if not provided
      userId,
    ]);

    // Add user information to the response
    const product = result.results[0];
    return c.json({
      ...product,
      created_by: {
        user_id: userId,
        username: userResult.results[0].username
      }
    }, 201);

  } catch (error) {
    return c.json({ 
      error: 'Failed to create product',
      details: error.message 
    }, 500);
  }
});

// Route: Get All Products (protected)
app.get('/api/products', jwtMiddleware, async (c) => {
  const result = await executeQuery(c, 'SELECT * FROM products');
  const products = result.results;

  return c.json(products); // Return the list of products
});

// Route: Get a Specific Product by ID (protected)
app.get('/api/products/:id', jwtMiddleware, async (c) => {
  const productId = c.req.param('id');
  
  // Fetch product data from D1
  const result = await executeQuery(c, `SELECT * FROM products WHERE product_id = ?`, [productId]);
  if (result.results.length === 0) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json(result.results[0]);
});

// Route: Update a Product (protected)
app.put('/api/products/:id', jwtMiddleware, async (c) => {
  const productId = c.req.param('id');
  const updates = await c.req.json(); // Data for updating

  // Prepare update fields
  const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const updateValues = Object.values(updates);

  // Update the product data in D1
  const result = await executeQuery(c, `
    UPDATE products
    SET ${updateFields}
    WHERE product_id = ?
    RETURNING *;
  `, [...updateValues, productId]);

  if (result.results.length === 0) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json(result.results[0]);
});

// Route: Delete a Product (protected)
app.delete('/api/products/:id', jwtMiddleware, async (c) => {
  const productId = c.req.param('id');

  // Delete the product from D1
  const result = await executeQuery(c, `DELETE FROM products WHERE product_id = ?`, [productId]);

  if (result.rowsAffected === 0) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json({ message: 'Product deleted' }, 204); // No content to return
});

// Route: Create Demand Forecasting (no protection)
app.post('/api/demand-forecasting', async (c) => {
  try {
    const { 
      forecasted_demand, 
      percentage, 
      locality 
    } = await c.req.json();

    // Validate required fields
    if (!percentage || !forecasted_demand || !locality) {
      return c.json({ 
        error: 'Missing required fields: forecast_date, forecasted_demand, and locality are required' 
      }, 400);
    }

    // Insert the new demand forecast into D1
    const result = await executeQuery(c, `
      INSERT INTO demand_forecasting (
        forecast_date,
        forecasted_demand,
        percentage,
        locality,
        created_at,
        updated_at
      )
      VALUES (CURRENT_TIMESTAMP, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `, [
      forecasted_demand,
      percentage,
      locality
    ]);

    return c.json(result.results[0], 201); // Return the created forecast

  } catch (error) {
    return c.json({ 
      error: 'Failed to create demand forecast',
      details: error.message 
    }, 500);
  }
});

// Route: Get Users and Inventory by Locality
app.get('/api/locality/:locality/inventory', jwtMiddleware, async (c) => {
  try {
    const locality = c.req.param('locality');

    // Query to get users and their products in the specified locality
    const result = await executeQuery(c, `
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.role,
        p.product_id,
        p.product_name,
        p.description,
        p.price,
        p.quantity_in_stock,
        p.created_at as product_created_at
      FROM users u
      LEFT JOIN products p ON u.user_id = p.user_id
      WHERE u.locality = ?
      AND p.quantity_in_stock > 0
      ORDER BY u.user_id, p.product_id
    `, [locality]);

    // Transform the flat results into a nested structure
    const usersMap = new Map();
    
    result.results.forEach(row => {
      if (!usersMap.has(row.user_id)) {
        // Initialize user entry
        usersMap.set(row.user_id, {
          user_id: row.user_id,
          username: row.username,
          email: row.email,
          role: row.role,
          locality: locality,
          products: []
        });
      }

      // Add product to user's products array if product exists
      if (row.product_id) {
        usersMap.get(row.user_id).products.push({
          product_id: row.product_id,
          product_name: row.product_name,
          description: row.description,
          price: row.price,
          quantity: row.quantity,
          created_at: row.product_created_at
        });
      }
    });

    // Convert map to array
    const users = Array.from(usersMap.values());

    // Return only users who have products
    const usersWithProducts = users.filter(user => user.products.length > 0);

    if (usersWithProducts.length === 0) {
      return c.json({ 
        message: 'No users found with available inventory in this locality',
        users: [] 
      }, 200);
    }

    return c.json({
      locality,
      total_users: usersWithProducts.length,
      users: usersWithProducts
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to fetch users and inventory',
      details: error.message 
    }, 500);
  }
});

// Optional: Add an endpoint to get summary statistics
app.get('/api/locality/:locality/inventory/summary', jwtMiddleware, async (c) => {
  try {
    const locality = c.req.param('locality');

    const result = await executeQuery(c, `
      SELECT 
        COUNT(DISTINCT u.user_id) as total_users,
        COUNT(DISTINCT p.product_id) as total_products,
        SUM(p.quantity_in_stock) as total_inventory,
        AVG(p.price) as average_price
      FROM users u
      LEFT JOIN products p ON u.user_id = p.user_id
      WHERE u.locality = ?
      AND p.quantity > 0
    `, [locality]);

    return c.json({
      locality,
      statistics: result.results[0]
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to fetch inventory summary',
      details: error.message 
    }, 500);
  }
});
// Route: Create Forecast
app.post('/api/forecasts', async (c) => {
  try {
    const { 
      city_name, 
      product_name, 
      predicted_orders, 
      percentage_change 
    } = await c.req.json();

    // Validate required fields
    if (!city_name || !product_name || !predicted_orders || percentage_change === undefined) {
      return c.json({ 
        error: 'Missing required fields: city_name, product_name, predicted_orders, and percentage_change are required' 
      }, 400);
    }

    

    if (!Number.isInteger(percentage_change)) {
      return c.json({ 
        error: 'percentage_change must be an integer' 
      }, 400);
    }

    // Insert the new forecast into D1
    const result = await executeQuery(c, `
      INSERT INTO forecasts (
        city_name,
        product_name,
        predicted_orders,
        percentage_change
      )
      VALUES (?, ?, ?, ?)
      RETURNING *;
    `, [
      city_name,
      product_name,
      predicted_orders,
      percentage_change
    ]);

    return c.json({
      message: 'Forecast created successfully',
      forecast: result.results[0]
    }, 201);

  } catch (error) {
    return c.json({ 
      error: 'Failed to create forecast',
      details: error.message 
    }, 500);
  }
});

// Optional: Get forecasts by city
app.get('/api/forecasts/:city', async (c) => {
  try {
    const city_name = c.req.param('city');

    const result = await executeQuery(c, `
      SELECT * FROM forecasts 
      WHERE city_name = ?
      ORDER BY product_name
    `, [city_name]);

    return c.json({
      city: city_name,
      forecasts: result.results
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to fetch forecasts',
      details: error.message 
    }, 500);
  }
});

// Route: Get Top 3 Highest Percentage Changes by City with Analytics
app.get('/api/forecasts/:city/top-changes/analytics', async (c) => {
  try {
    const city_name = c.req.param('city');

    // Get top 3 changes
    const topChanges = await executeQuery(c, `
      SELECT 
        city_name,
        product_name,
        predicted_orders,
        percentage_change
      FROM forecasts 
      WHERE city_name = ?
      ORDER BY percentage_change DESC
      LIMIT 3
    `, [city_name]);

    // Get statistics
    const stats = await executeQuery(c, `
      SELECT 
        COUNT(*) as total_products,
        AVG(percentage_change) as avg_change,
        MIN(percentage_change) as min_change,
        MAX(percentage_change) as max_change,
        SUM(predicted_orders) as total_predicted_orders
      FROM forecasts
      WHERE city_name = ?
    `, [city_name]);

    // If no results found
    if (topChanges.results.length === 0) {
      return c.json({
        city: city_name,
        message: "No forecasts found for this city",
        analytics: null,
        top_changes: []
      });
    }

    const statistics = stats.results[0];

    return c.json({
      city: city_name,
      analytics: {
        total_products: statistics.total_products,
        average_change: Math.round(statistics.avg_change),
        minimum_change: statistics.min_change,
        maximum_change: statistics.max_change,
        total_predicted_orders: statistics.total_predicted_orders,
        insights: {
          volatility: statistics.max_change - statistics.min_change,
          above_average_count: topChanges.results.filter(
            f => f.percentage_change > statistics.avg_change
          ).length
        }
      },
      top_changes: topChanges.results.map(forecast => ({
        product_name: forecast.product_name,
        percentage_change: forecast.percentage_change,
        predicted_orders: forecast.predicted_orders,
        difference_from_average: Math.round(
          forecast.percentage_change - statistics.avg_change
        ),
        contribution_to_total: Math.round(
          (forecast.predicted_orders / statistics.total_predicted_orders) * 100
        ) + '%'
      }))
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to fetch top percentage changes',
      details: error.message 
    }, 500);
  }
});

// Optional: Get all forecasts
app.get('/api/forecasts', async (c) => {
  try {
    const result = await executeQuery(c, `
      SELECT * FROM forecasts 
      ORDER BY city_name, product_name
    `);

    // Group forecasts by city
    const forecastsByCity = result.results.reduce((acc, forecast) => {
      if (!acc[forecast.city_name]) {
        acc[forecast.city_name] = [];
      }
      acc[forecast.city_name].push(forecast);
      return acc;
    }, {});

    return c.json({
      cities: Object.keys(forecastsByCity).length,
      forecasts: forecastsByCity
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to fetch forecasts',
      details: error.message 
    }, 500);
  }
});

// Optional: Get forecasts by product
app.get('/api/forecasts/product/:product_name', async (c) => {
  try {
    const product_name = c.req.param('product_name');

    const result = await executeQuery(c, `
      SELECT * FROM forecasts 
      WHERE product_name = ?
      ORDER BY city_name
    `, [product_name]);

    return c.json({
      product: product_name,
      cities: result.results.length,
      forecasts: result.results
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to fetch forecasts',
      details: error.message 
    }, 500);
  }
});

// Route: Search Products with Fuzzy Matching
app.get('/api/forecasts/search/:query', async (c) => {
  try {
    const searchQuery = c.req.param('query');
    const minSimilarity = c.req.query('similarity') || 0.3; // Default similarity threshold

    // Prepare the search pattern
    const searchPattern = `%${searchQuery.toLowerCase()}%`;

    // Query with fuzzy matching and similarity ranking
    const result = await executeQuery(c, `
      WITH ProductMatches AS (
        SELECT DISTINCT 
          product_name,
          CASE 
            -- Exact match gets highest score
            WHEN LOWER(product_name) = LOWER(?) THEN 1.0
            -- Starts with gets high score
            WHEN LOWER(product_name) LIKE ? THEN 0.8
            -- Contains gets medium score
            WHEN LOWER(product_name) LIKE ? THEN 0.6
            -- Contains parts gets lower score
            ELSE 0.4
          END as similarity_score
        FROM forecasts
        WHERE 
          LOWER(product_name) LIKE ?
          OR LOWER(product_name) LIKE ?
          OR LOWER(product_name) LIKE ?
          OR ? LIKE CONCAT('%', LOWER(product_name), '%')
      )
      SELECT 
        pm.product_name,
        pm.similarity_score,
        f.city_name,
        f.predicted_orders,
        f.percentage_change
      FROM ProductMatches pm
      JOIN forecasts f ON LOWER(pm.product_name) = LOWER(f.product_name)
      WHERE pm.similarity_score >= ?
      ORDER BY 
        pm.similarity_score DESC,
        pm.product_name,
        f.city_name
    `, [
      searchQuery.toLowerCase(),                    // Exact match
      `${searchQuery.toLowerCase()}%`,             // Starts with
      `%${searchQuery.toLowerCase()}%`,            // Contains
      searchPattern,                               // General pattern
      `%${searchQuery.toLowerCase()}`,             // Ends with
      `%${searchQuery.split('').join('%')}%`,      // Contains letters in order
      searchQuery.toLowerCase(),                    // Reverse match
      minSimilarity                                // Minimum similarity threshold
    ]);

    // Group results by product
    const groupedResults = result.results.reduce((acc, curr) => {
      const key = curr.product_name;
      if (!acc[key]) {
        acc[key] = {
          product_name: key,
          similarity_score: curr.similarity_score,
          total_predicted_orders: 0,
          average_percentage_change: 0,
          cities: []
        };
      }

      acc[key].cities.push({
        city_name: curr.city_name,
        predicted_orders: curr.predicted_orders,
        percentage_change: curr.percentage_change
      });

      acc[key].total_predicted_orders += curr.predicted_orders;
      acc[key].average_percentage_change = 
        acc[key].cities.reduce((sum, city) => sum + city.percentage_change, 0) / 
        acc[key].cities.length;

      return acc;
    }, {});

    const products = Object.values(groupedResults);

    // If no results found
    if (products.length === 0) {
      return c.json({
        query: searchQuery,
        message: "No matching products found",
        suggestions: [
          "Try using fewer characters",
          "Check for typos",
          "Use more general terms"
        ],
        products: []
      });
    }

    // Calculate some statistics
    const stats = {
      total_matches: products.length,
      average_similarity: products.reduce((sum, p) => sum + p.similarity_score, 0) / products.length,
      total_cities: products.reduce((sum, p) => sum + p.cities.length, 0),
      highest_similarity: Math.max(...products.map(p => p.similarity_score))
    };

    return c.json({
      query: searchQuery,
      statistics: stats,
      products: products.map(product => ({
        ...product,
        cities_count: product.cities.length,
        total_predicted_orders: product.total_predicted_orders,
        average_percentage_change: Math.round(product.average_percentage_change),
        similarity_score: Math.round(product.similarity_score * 100) + '%',
        cities: product.cities.sort((a, b) => b.predicted_orders - a.predicted_orders)
      }))
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to search products',
      details: error.message 
    }, 500);
  }
});
// Export the Hono app asexport default app;
export default app;