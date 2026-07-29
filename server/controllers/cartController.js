const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], subtotal: 0, total: 0 });
    }
    
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], subtotal: 0, total: 0 });
    }

    const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

    if (itemIndex > -1) {
      let item = cart.items[itemIndex];
      item.quantity += quantity;
      cart.items[itemIndex] = item;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    cart.subtotal = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    cart.total = cart.subtotal;

    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(p => p._id.toString() === req.params.itemId);

    if (itemIndex > -1) {
      let item = cart.items[itemIndex];
      item.quantity = quantity;
      cart.items[itemIndex] = item;
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.subtotal = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    cart.total = cart.subtotal;

    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeCartItem = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(p => p._id.toString() !== req.params.itemId);

    cart.subtotal = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    cart.total = cart.subtotal;

    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      cart.total = 0;
      await cart.save();
    }
    
    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
