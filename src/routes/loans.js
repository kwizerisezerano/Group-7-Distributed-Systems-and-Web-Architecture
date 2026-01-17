const express = require('express');
const repo = require('../data/repo');

const router = express.Router();

// GET loans
router.get('/', async (req, res) => {
  const items = await repo.getLoans();
  res.json({ items });
});

// Create a loan (member borrows a book)
router.post('/', async (req, res) => {
  const { bookId, memberId } = req.body;
  if (!bookId || !memberId) return res.status(400).json({ error: 'bookId and memberId required' });
  try {
    const loan = await repo.createLoan(bookId, memberId);
    res.status(201).location(`/loans/${loan.id}`).json(loan);
  } catch (err) {
    if (err.code === 'BOOK_NOT_FOUND' || err.code === 'MEMBER_NOT_FOUND') return res.status(404).json({ error: err.message });
    if (err.code === 'BOOK_UNAVAILABLE') return res.status(409).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// Return a loaned book
router.post('/:id/return', async (req, res) => {
  try {
    const loan = await repo.returnLoan(req.params.id);
    res.json(loan);
  } catch (err) {
    if (err.code === 'LOAN_NOT_FOUND') return res.status(404).json({ error: err.message });
    if (err.code === 'ALREADY_RETURNED') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// get loan
router.get('/:id', async (req, res) => {
  const loan = await repo.getLoanById(req.params.id);
  if (!loan) return res.status(404).json({ error: 'not found' });
  res.json(loan);
});

// Delete loan record
router.delete('/:id', async (req, res) => {
  const loan = await repo.getLoanById(req.params.id);
  if (!loan) return res.status(404).json({ error: 'not found' });
  await repo.deleteLoan(req.params.id);
  res.status(200).json({ success: true, id: req.params.id });
});

module.exports = router;
