const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const { uploadMultipleImages } = require('../utils/cloudinary');

// GET /api/products
exports.getAll = async (req, res, next) => {
  try {
    const { status, category, brand, featured, bestseller, new_arrival, search, sort, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (featured === 'true') filter.is_featured = true;
    if (bestseller === 'true') filter.is_bestseller = true;
    if (new_arrival === 'true') filter.is_new_arrival = true;

    // Filter by Category slug or ID
    if (category) {
      if (/^[0-9a-fA-F]{24}$/.test(category)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) filter.category = cat._id;
        else filter.category = null; // No match
      }
    }

    // Filter by Brand slug or ID
    if (brand) {
      if (/^[0-9a-fA-F]{24}$/.test(brand)) {
        filter.brand = brand;
      } else {
        const br = await Brand.findOne({ slug: brand });
        if (br) filter.brand = br._id;
        else filter.brand = null; // No match
      }
    }

    // Search query
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort) {
      if (sort === 'price_asc') sortOptions = { price: 1 };
      else if (sort === 'price_desc') sortOptions = { price: -1 };
      else if (sort === 'name_asc') sortOptions = { name: 1 };
      else if (sort === 'name_desc') sortOptions = { name: -1 };
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo_url')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(filter);

    // Normalize field names for frontend
    const normalized = products.map(p => {
      const obj = p.toObject({ virtuals: true });
      return {
        ...obj,
        id: p._id,
        category_name: p.category?.name || 'Uncategorized',
        category_slug: p.category?.slug || '',
        brand_name: p.brand?.name || '',
        brand_slug: p.brand?.slug || '',
      };
    });

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products: normalized
    });
  } catch (err) { next(err); }
};

// GET /api/products/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ is_active: true }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) { next(err); }
};

// GET /api/products/:slugOrId
exports.getOne = async (req, res, next) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.slugOrId)
      ? { _id: req.params.slugOrId }
      : { slug: req.params.slugOrId };

    const product = await Product.findOne(query)
      .populate('category', 'name slug image_url')
      .populate('brand', 'name slug logo_url');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

// POST /api/products
exports.create = async (req, res, next) => {
  try {
    const {
      name, description, category, brand, price, original_price,
      discount, stock, sizes, status, is_featured, is_bestseller,
      is_new_arrival, is_active
    } = req.body;

    if (!name || !price) return res.status(400).json({ success: false, message: 'Name and Price are required' });

    // Handle specifications JSON string parsing
    let specifications = {};
    if (req.body.specifications) {
      try {
        specifications = typeof req.body.specifications === 'string'
          ? JSON.parse(req.body.specifications)
          : req.body.specifications;
      } catch (err) {
        console.error('Error parsing specifications:', err);
      }
    }

    // Resolve category ObjectId
    let catId = null;
    if (category) {
      if (/^[0-9a-fA-F]{24}$/.test(category)) {
        catId = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        catId = cat?._id;
      }
    }

    // Resolve brand ObjectId
    let brandId = null;
    if (brand) {
      if (/^[0-9a-fA-F]{24}$/.test(brand)) {
        brandId = brand;
      } else {
        const br = await Brand.findOne({ slug: brand });
        brandId = br?._id;
      }
    }

    // Generate slug
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check unique slug
    const existing = await Product.findOne({ slug });
    if (existing) return res.status(409).json({ success: false, message: 'Product with this name already exists' });

    // Upload multiple images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadMultipleImages(req.files);
    }

    const product = await Product.create({
      name,
      slug,
      description,
      category: catId,
      brand: brandId,
      price: Number(price),
      original_price: original_price ? Number(original_price) : undefined,
      discount: discount ? Number(discount) : 0,
      stock: stock ? Number(stock) : 0,
      sizes: sizes || 'S,M,L,XL',
      specifications,
      is_featured: is_featured === 'true' || is_featured === true,
      is_bestseller: is_bestseller === 'true' || is_bestseller === true,
      is_new_arrival: is_new_arrival === 'true' || is_new_arrival === true,
      is_active: is_active !== 'false' && is_active !== false,
      status: status || 'active',
      images: imageUrls,
      image_url: imageUrls.length > 0 ? imageUrls[0] : null
    });

    res.status(201).json({ success: true, product });
  } catch (err) { next(err); }
};

// PUT /api/products/:id
exports.update = async (req, res, next) => {
  try {
    const {
      name, description, category, brand, price, original_price,
      discount, stock, sizes, status, is_featured, is_bestseller,
      is_new_arrival, is_active, existing_images
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const updates = {};
    if (name !== undefined) {
      updates.name = name;
      updates.slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (original_price !== undefined) updates.original_price = original_price ? Number(original_price) : undefined;
    if (discount !== undefined) updates.discount = Number(discount);
    if (stock !== undefined) updates.stock = Number(stock);
    if (sizes !== undefined) updates.sizes = sizes;
    if (status !== undefined) updates.status = status;
    if (is_featured !== undefined) updates.is_featured = is_featured === 'true' || is_featured === true;
    if (is_bestseller !== undefined) updates.is_bestseller = is_bestseller === 'true' || is_bestseller === true;
    if (is_new_arrival !== undefined) updates.is_new_arrival = is_new_arrival === 'true' || is_new_arrival === true;
    if (is_active !== undefined) updates.is_active = is_active === 'true' || is_active === true;

    // Handle specifications JSON string parsing
    if (req.body.specifications !== undefined) {
      try {
        updates.specifications = typeof req.body.specifications === 'string'
          ? JSON.parse(req.body.specifications)
          : req.body.specifications;
      } catch (err) {
        console.error('Error parsing specifications:', err);
      }
    }

    // Resolve category
    if (category !== undefined) {
      if (!category) {
        updates.category = null;
      } else if (/^[0-9a-fA-F]{24}$/.test(category)) {
        updates.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        updates.category = cat?._id || null;
      }
    }

    // Resolve brand
    if (brand !== undefined) {
      if (!brand) {
        updates.brand = null;
      } else if (/^[0-9a-fA-F]{24}$/.test(brand)) {
        updates.brand = brand;
      } else {
        const br = await Brand.findOne({ slug: brand });
        updates.brand = br?._id || null;
      }
    }

    // Handle images array merging
    let finalImages = [];
    if (existing_images) {
      // existing_images can be a comma-separated string or array
      finalImages = Array.isArray(existing_images) 
        ? existing_images 
        : existing_images.split(',').map(s => s.trim()).filter(Boolean);
    } else if (req.body.images && Array.isArray(req.body.images)) {
      finalImages = req.body.images;
    } else {
      // Default to keeping existing product images if not specified
      finalImages = product.images || [];
    }

    // Upload any new images
    if (req.files && req.files.length > 0) {
      const newImageUrls = await uploadMultipleImages(req.files);
      finalImages = [...finalImages, ...newImageUrls];
    }

    updates.images = finalImages;
    updates.image_url = finalImages.length > 0 ? finalImages[0] : null;

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, product: updatedProduct });
  } catch (err) { next(err); }
};

// DELETE /api/products/:id
exports.remove = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
};
