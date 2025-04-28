import express from 'express';
import Cart from '../models/Cart.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('products.product');
  res.json(cart || { products: [] });
});

router.post('/', async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = new Cart({ user: req.user.id, products: [{ product: productId, quantity }] });
  } else {
    const itemIndex = cart.products.findIndex((p) => p.product.toString() === productId);
    if (itemIndex > -1) {
      cart.products[itemIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }
  }

  await cart.save();
  res.status(200).json(cart);
});

router.delete('/:productId', async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (cart) {
    cart.products = cart.products.filter((p) => p.product.toString() !== req.params.productId);
    await cart.save();
    res.json(cart);
  } else {
    res.status(404).json({ message: 'Cart not found' });
  }
});