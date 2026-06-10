const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/transactions — supports ?month=&year=&type=&account=
router.get('/', async (req, res) => {
  try {
    const filter = { user: req.user._id };

    if (req.query.month !== undefined && req.query.year !== undefined) {
      const month = parseInt(req.query.month);
      const year = parseInt(req.query.year);
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    if (req.query.type && req.query.type !== 'all') {
      filter.type = req.query.type;
    }

    if (req.query.account) {
      filter.account = req.query.account;
    }

    const transactions = await Transaction.find(filter)
      .populate('account', 'name type color')
      .populate('toAccount', 'name type')
      .sort({ date: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/transactions/summary — monthly summary stats
router.get('/summary', async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    const txs = await Transaction.find({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    });

    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Category breakdown
    const cats = {};
    txs.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });

    res.json({ income, expense, net: income - expense, categories: cats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { accountId, type, amount, description, category, date, toAccountId, notes } = req.body;

    if (!accountId || !type || !amount || !date) {
      return res.status(400).json({ message: 'accountId, type, amount, and date are required' });
    }

    const account = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const tx = await Transaction.create({
      user: req.user._id,
      account: accountId,
      type,
      amount: parseFloat(amount),
      description: description || 'Transaction',
      category: category || '💰 Other',
      date: new Date(date),
      toAccount: toAccountId || null,
      notes: notes || '',
    });

    // Update account balance
    if (type === 'expense') account.balance -= parseFloat(amount);
    else if (type === 'income') account.balance += parseFloat(amount);
    else if (type === 'transfer' && toAccountId) {
      account.balance -= parseFloat(amount);
      const toAcc = await Account.findOne({ _id: toAccountId, user: req.user._id });
      if (toAcc) { toAcc.balance += parseFloat(amount); await toAcc.save(); }
    }
    await account.save();

    const populated = await tx.populate('account', 'name type color');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    const oldAccount = await Account.findById(tx.account);

    // Reverse old effect
    if (oldAccount) {
      if (tx.type === 'expense') oldAccount.balance += tx.amount;
      else if (tx.type === 'income') oldAccount.balance -= tx.amount;
      await oldAccount.save();
    }

    const { accountId, type, amount, description, category, date, notes } = req.body;

    tx.account = accountId || tx.account;
    tx.type = type || tx.type;
    tx.amount = amount ? parseFloat(amount) : tx.amount;
    tx.description = description || tx.description;
    tx.category = category || tx.category;
    tx.date = date ? new Date(date) : tx.date;
    tx.notes = notes !== undefined ? notes : tx.notes;

    await tx.save();

    // Apply new effect
    const newAccount = await Account.findById(tx.account);
    if (newAccount) {
      if (tx.type === 'expense') newAccount.balance -= tx.amount;
      else if (tx.type === 'income') newAccount.balance += tx.amount;
      await newAccount.save();
    }

    const populated = await tx.populate('account', 'name type color');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    // Reverse balance effect
    const account = await Account.findById(tx.account);
    if (account) {
      if (tx.type === 'expense') account.balance += tx.amount;
      else if (tx.type === 'income') account.balance -= tx.amount;
      await account.save();
    }

    await tx.deleteOne();
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
