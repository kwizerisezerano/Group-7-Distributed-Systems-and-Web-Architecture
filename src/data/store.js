const { v4: uuidv4 } = require('uuid');

// In-memory data store
const books = [];
const authors = [];
const members = [];
const loans = [];

function nowISO() {
  return new Date().toISOString();
}

// Seed with a couple of items
function seed() {
  const a1 = { id: uuidv4(), name: 'Jane Austen', createdAt: nowISO(), updatedAt: nowISO() };
  const a2 = { id: uuidv4(), name: 'George Orwell', createdAt: nowISO(), updatedAt: nowISO() };
  authors.push(a1, a2);

  const b1 = { id: uuidv4(), title: 'Pride and Prejudice', authorId: a1.id, available: true, createdAt: nowISO(), updatedAt: nowISO() };
  const b2 = { id: uuidv4(), title: '1984', authorId: a2.id, available: true, createdAt: nowISO(), updatedAt: nowISO() };
  books.push(b1, b2);

  const m1 = { id: uuidv4(), name: 'Alice', createdAt: nowISO(), updatedAt: nowISO() };
  members.push(m1);
}

seed();

module.exports = {
  books,
  authors,
  members,
  loans,
  nowISO,
};
