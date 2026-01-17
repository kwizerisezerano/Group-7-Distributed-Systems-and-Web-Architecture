const express = require('express');
const crypto = require('crypto');
const repo = require('../data/repo');

const router = express.Router();

router.get('/', async (req, res) => {
  const items = await repo.getMembers();
  res.set('Cache-Control', 'private, max-age=30');
  res.json({ items });
});

router.get('/:id', async (req, res) => {
  const m = await repo.getMemberById(req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  res.json(m);
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const member = await repo.createMember(name);
  res.status(201).location(`/members/${member.id}`).json(member);
});

router.put('/:id', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const existing = await repo.getMemberById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const updated = await repo.updateMember(req.params.id, name);
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const existing = await repo.getMemberById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  await repo.deleteMember(req.params.id);
  res.status(204).end();
});

module.exports = router;
