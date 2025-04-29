import express from 'express';
import Cart from '../models/Cart.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/', async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('products.product');
  if (!cart || cart.products.length === 0) return res.status(400).json({ message: 'Cart is empty' });

  const lineItems = cart.products.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.product.name },
      unit_amount: Math.round(item.product.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    success_url: `${process.env.CLIENT_URL}/success`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
  });

  res.json({ url: session.url });
});

export default router;
