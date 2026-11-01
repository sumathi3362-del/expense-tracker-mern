require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/transactions', async (_req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1, createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Fetch transactions failed:', error);
    res.status(500).json({ message: 'Could not fetch transactions.' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;
    if (!description?.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !['income', 'expense'].includes(type) || !category?.trim()) {
      return res.status(400).json({ message: 'Enter a description, positive amount, valid type, and category.' });
    }
    const transaction = await Transaction.create({ description, amount: Number(amount), type, category, date: date || new Date() });
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction failed:', error);
    res.status(500).json({ message: 'Could not save transaction.' });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;
    if (!description?.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !['income', 'expense'].includes(type) || !category?.trim()) {
      return res.status(400).json({ message: 'Enter a description, positive amount, valid type, and category.' });
    }
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { description: description.trim(), amount: Number(amount), type, category: category.trim(), date: date || new Date() },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Transaction not found.' });
    res.json(updated);
  } catch (error) {
    console.error('Update transaction failed:', error);
    res.status(500).json({ message: 'Could not update transaction.' });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ message: 'Transaction deleted.' });
  } catch (error) {
    console.error('Delete transaction failed:', error);
    res.status(500).json({ message: 'Could not delete transaction.' });
  }
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_tracker');
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}
start();
