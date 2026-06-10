const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// All routes require auth
router.use(protect);

// GET /api/accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/accounts
router.post('/', async (req, res) => {
  try {
    const { name, type, balance, salary, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Account name is required' });

    const account = await Account.create({
      user: req.user._id,
      name,
      type: type || 'bank',
      balance: balance || 0,
      salary: salary || 0,
      color: color || '#1fcf8a',
    });

    // Auto-create salary income transaction if salary set
    if (salary && salary > 0) {
      const today = new Date();
      await Transaction.create({
        user: req.user._id,
        account: account._id,
        type: 'income',
        amount: salary,
        description: 'Monthly salary',
        category: '💰 Salary',
        date: today,
      });
    }

    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/accounts/:id
router.put('/:id', async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const { name, type, balance, salary, color } = req.body;
    if (name !== undefined) account.name = name;
    if (type !== undefined) account.type = type;
    if (balance !== undefined) account.balance = balance;
    if (salary !== undefined) account.salary = salary;
    if (color !== undefined) account.color = color;

    await account.save();
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/accounts/:id
router.delete('/:id', async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    // Delete all transactions for this account
    await Transaction.deleteMany({ user: req.user._id, account: account._id });
    await account.deleteOne();

    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/accounts/:id/stats — income/expense totals for an account
router.get('/:id/stats', async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const txs = await Transaction.find({ user: req.user._id, account: account._id });
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    res.json({ income, expense, transactions: txs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
