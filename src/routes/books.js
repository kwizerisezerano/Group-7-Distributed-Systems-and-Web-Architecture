const express = require('express');
const crypto = require('crypto');
const repo = require('../data/repo');

const router = express.Router();

function makeETag(obj) {
  const str = JSON.stringify(obj);
  return crypto.createHash('md5').update(str).digest('hex');
}

// GET /books - list books
router.get('/', async (req, res) => {
  const items = await repo.getBooks();
  const repr = items.map(b => ({ ...b, links: { self: `/books/${b.id}`, author: `/authors/${b.authorId}` } }));
  const etag = makeETag(repr);
  res.set('Cache-Control', 'public, max-age=10');
  res.set('ETag', etag);
  if (req.headers['if-none-match'] === etag) return res.status(304).end();
  res.json({ items: repr, count: repr.length, links: { self: '/books' } });
});

// GET /books/:id - get a book
router.get('/:id', async (req, res) => {
  const book = await repo.getBookById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Not found' });
  const repr = { ...book, links: { self: `/books/${book.id}`, author: `/authors/${book.authorId}` } };
  const etag = makeETag(repr);
  res.set('Cache-Control', 'public, max-age=30');
  res.set('ETag', etag);
  if (req.headers['if-none-match'] === etag) return res.status(304).end();
  res.json(repr);
});

// POST /books - create
router.post('/', async (req, res) => {
  const { title, authorId } = req.body;
  if (!title || !authorId) return res.status(400).json({ error: 'title and authorId required' });
  try {
    const book = await repo.createBook({ title, authorId });
    res.status(201).location(`/books/${book.id}`).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /books/:id - full update
router.put('/:id', async (req, res) => {
  const { title, authorId, available } = req.body;
  if (!title || !authorId || typeof available !== 'boolean') return res.status(400).json({ error: 'title, authorId and available required' });
  const existing = await repo.getBookById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const updated = await repo.updateBook(req.params.id, { title, authorId, available });
  res.json(updated);
});

// PATCH /books/:id - partial update
router.patch('/:id', async (req, res) => {
  const book = await repo.getBookById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Not found' });
  const allowed = ['title', 'authorId', 'available'];
  const patch = {};
  for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
  const merged = { ...book, ...patch };
  const updated = await repo.updateBook(req.params.id, merged);
  res.json(updated);
});

// DELETE /books/:id
router.delete('/:id', async (req, res) => {
  const existing = await repo.getBookById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  await repo.deleteBook(req.params.id);
  // Return 200 OK with confirmation body per requested behavior
  res.status(200).json({ success: true, id: req.params.id });
});

module.exports = router;
