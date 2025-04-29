import express from 'express';
import Product from '../models/Product.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.post('/', authenticateUser, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Not allowed' });
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
});

router.patch('/:id', authenticateUser, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Not allowed' });
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

router.delete('/:id', authenticateUser, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Not allowed' });
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

export default router;
