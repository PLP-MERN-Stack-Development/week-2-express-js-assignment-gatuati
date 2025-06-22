
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Custom middleware implementations

// Logger middleware
const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

// Authentication middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  

  if (!apiKey || apiKey !== 'secret-api-key') {
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
  }
  
  next();
};

// Validation middleware for product creation
const validateProduct = (req, res, next) => {
  const { name, price, category } = req.body;
  
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }
  
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }
  
  next();
};

// Middleware setup
app.use(bodyParser.json());
app.use(logger);

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// GET /api/products - Get all products (with optional filtering)
app.get('/api/products', (req, res) => {
  const { category, minPrice, maxPrice, inStock } = req.query;
  let filteredProducts = [...products];
  
  if (category) {
    filteredProducts = filteredProducts.filter(
      p => p.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  if (minPrice) {
    filteredProducts = filteredProducts.filter(
      p => p.price >= parseFloat(minPrice)
    );
  }
  
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(
      p => p.price <= parseFloat(maxPrice)
    );
  }
  
  if (inStock) {
    filteredProducts = filteredProducts.filter(
      p => p.inStock === (inStock.toLowerCase() === 'true')
    );
  }
  
  res.json(filteredProducts);
});

// GET /api/products/:id - Get a specific product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// POST /api/products - Create a new product (protected route)
app.post('/api/products', authenticate, validateProduct, (req, res) => {
  const newProduct = {
    id: uuidv4(),
    name: req.body.name,
    description: req.body.description || '',
    price: req.body.price,
    category: req.body.category,
    inStock: req.body.inStock !== undefined ? req.body.inStock : true
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update a product (protected route)
app.put('/api/products/:id', authenticate, (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  // Validate price if provided
  if (req.body.price && (typeof req.body.price !== 'number' || req.body.price <= 0)) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }
  
  const updatedProduct = {
    ...products[productIndex],
    ...req.body,
    id: req.params.id // Ensure ID remains the same
  };
  
  products[productIndex] = updatedProduct;
  res.json(updatedProduct);
});

// DELETE /api/products/:id - Delete a product (protected route)
app.delete('/api/products/:id', authenticate, (req, res) => {
  const initialLength = products.length;
  products = products.filter(p => p.id !== req.params.id);
  
  if (products.length === initialLength) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.status(204).send();
});

// Advanced features

// Search products by name
app.get('/api/products/search', (req, res) => {
  const { name } = req.query;
  
  if (!name) {
    return res.status(400).json({ error: 'Name query parameter is required' });
  }
  
  const results = products.filter(p => 
    p.name.toLowerCase().includes(name.toLowerCase())
  );
  
  res.json(results);
});

// Get product statistics
app.get('/api/products/stats', (req, res) => {
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length,
    byCategory: {}
  };
  
  products.forEach(product => {
    if (!stats.byCategory[product.category]) {
      stats.byCategory[product.category] = 0;
    }
    stats.byCategory[product.category]++;
  });
  
  res.json(stats);
});

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app;