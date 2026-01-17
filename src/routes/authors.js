const express = require('express');
const crypto = require('crypto');
const repo = require('../data/repo');

const router = express.Router();

function makeETag(obj) {
  const str = JSON.stringify(obj);
  return crypto.createHash('md5').update(str).digest('hex');
}

router.get('/', async (req, res) => {
  const items = await repo.getAuthors();
  const repr = items.map(a => ({ ...a, links: { self: `/authors/${a.id}` } }));
  const etag = makeETag(repr);
  res.set('Cache-Control', 'public, max-age=60');
  res.set('ETag', etag);
  if (req.headers['if-none-match'] === etag) return res.status(304).end();
  res.json({ items: repr });
});

router.get('/:id', async (req, res) => {
  const a = await repo.getAuthorById(req.params.id);
  if (!a) return res.status(404).json({ error: 'Not found' });
  const etag = makeETag(a);
  res.set('Cache-Control', 'public, max-age=60');
  res.set('ETag', etag);
  if (req.headers['if-none-match'] === etag) return res.status(304).end();
  res.json(a);
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const author = await repo.createAuthor(name);
  res.status(201).location(`/authors/${author.id}`).json(author);
});

router.put('/:id', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const existing = await repo.getAuthorById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const updated = await repo.updateAuthor(req.params.id, name);
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const existing = await repo.getAuthorById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  await repo.deleteAuthor(req.params.id);
  res.status(200).json({ success: true, id: req.params.id });
});

module.exports = router;
