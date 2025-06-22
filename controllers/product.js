const { v4: uuidv4 } = require('uuid');
const { NotFoundError } = require('../utils/errors');

let products = []; // In-memory database (replace with DB in production)

module.exports = {
  getAllProducts: (category, page = 1, limit = 10) => {
    let results = [...products];
    if (category) {
      results = results.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    const startIndex = (page - 1) * limit;
    return {
      data: results.slice(startIndex, startIndex + limit),
      total: results.length,
      page,
      limit
    };
  },

  getProductById: (id) => {
    const product = products.find(p => p.id === id);
    if (!product) throw new NotFoundError('Product not found');
    return product;
  },

  createProduct: (productData) => {
    const newProduct = {
      id: uuidv4(),
      ...productData,
      inStock: productData.inStock !== false
    };
    products.push(newProduct);
    return newProduct;
  },

  updateProduct: (id, updateData) => {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new NotFoundError('Product not found');
    
    products[index] = { ...products[index], ...updateData };
    return products[index];
  },

  deleteProduct: (id) => {
    const initialLength = products.length;
    products = products.filter(p => p.id !== id);
    if (products.length === initialLength) {
      throw new NotFoundError('Product not found');
    }
    return { success: true };
  }
};