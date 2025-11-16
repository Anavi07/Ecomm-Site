const Product = require('../models/Product');

// Get all products with pagination and filtering
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, minPrice, maxPrice, search } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Fetch products
    const products = await Product.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        limit,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create product (admin and vendor only)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, images } = req.body;
    const vendorId = req.user.id; // From JWT token

    // Validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, and category are required',
      });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      stock: stock || 0,
      images: images || [],
      vendor: vendorId,
    });

    const newProduct = await product.save();
    await newProduct.populate('vendor', 'name email');
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update product (admin and vendor - vendor can only edit their own products)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check authorization: vendor can only update their own products, admin can update all
    if (req.user.role === 'vendor' && product.vendor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own products',
      });
    }

    // Update allowed fields
    const allowedFields = ['name', 'description', 'price', 'category', 'stock', 'images'];
    Object.keys(req.body).forEach((field) => {
      if (allowedFields.includes(field)) {
        product[field] = req.body[field];
      }
    });

    product.updatedAt = Date.now();
    const updatedProduct = await product.save();
    await updatedProduct.populate('vendor', 'name email');
    res.json({ success: true, data: updatedProduct });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add review to product
exports.addReview = async (req, res) => {
  try {
    const { user, rating, comment } = req.body;

    if (!user || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'User, rating, and comment are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review = { user, rating, comment };
    product.reviews.push(review);

    // Update average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.ratings = totalRating / product.reviews.length;

    const updatedProduct = await product.save();
    res.status(201).json({ success: true, data: updatedProduct });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

