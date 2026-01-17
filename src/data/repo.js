const { v4: uuidv4 } = require('uuid');
const { initPool } = require('./db');

async function getAuthors() {
  const pool = await initPool();
  const [rows] = await pool.query('SELECT id, name, created_at AS createdAt, updated_at AS updatedAt FROM authors');
  return rows;
}

async function getAuthorById(id) {
  const pool = await initPool();
  const [rows] = await pool.query('SELECT id, name, created_at AS createdAt, updated_at AS updatedAt FROM authors WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createAuthor(name) {
  const id = uuidv4();
  const pool = await initPool();
  await pool.query('INSERT INTO authors (id, name) VALUES (?, ?)', [id, name]);
  return await getAuthorById(id);
}

async function updateAuthor(id, name) {
  const pool = await initPool();
  await pool.query('UPDATE authors SET name = ?, updated_at = NOW() WHERE id = ?', [name, id]);
  return await getAuthorById(id);
}

async function deleteAuthor(id) {
  const pool = await initPool();
  await pool.query('DELETE FROM authors WHERE id = ?', [id]);
}

// Books
async function getBooks() {
  const pool = await initPool();
  const [rows] = await pool.query(`
    SELECT b.id, b.title, b.author_id AS authorId, b.available, b.created_at AS createdAt, b.updated_at AS updatedAt, a.name AS authorName
    FROM books b
    JOIN authors a ON a.id = b.author_id
  `);
  return rows.map(r => ({ id: r.id, title: r.title, authorId: r.authorId, available: !!r.available, createdAt: r.createdAt, updatedAt: r.updatedAt }));
}

async function getBookById(id) {
  const pool = await initPool();
  const [rows] = await pool.query('SELECT id, title, author_id AS authorId, available, created_at AS createdAt, updated_at AS updatedAt FROM books WHERE id = ?', [id]);
  const r = rows[0];
  if (!r) return null;
  return { id: r.id, title: r.title, authorId: r.authorId, available: !!r.available, createdAt: r.createdAt, updatedAt: r.updatedAt };
}

async function createBook({ title, authorId }) {
  const id = uuidv4();
  const pool = await initPool();
  await pool.query('INSERT INTO books (id, title, author_id, available) VALUES (?, ?, ?, 1)', [id, title, authorId]);
  return await getBookById(id);
}

async function updateBook(id, { title, authorId, available }) {
  const pool = await initPool();
  await pool.query('UPDATE books SET title = ?, author_id = ?, available = ?, updated_at = NOW() WHERE id = ?', [title, authorId, available ? 1 : 0, id]);
  return await getBookById(id);
}

async function deleteBook(id) {
  const pool = await initPool();
  await pool.query('DELETE FROM books WHERE id = ?', [id]);
}

// Members
async function getMembers() {
  const pool = await initPool();
  const [rows] = await pool.query('SELECT id, name, created_at AS createdAt, updated_at AS updatedAt FROM members');
  return rows;
}

async function getMemberById(id) {
  const pool = await initPool();
  const [rows] = await pool.query('SELECT id, name, created_at AS createdAt, updated_at AS updatedAt FROM members WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createMember(name) {
  const id = uuidv4();
  const pool = await initPool();
  await pool.query('INSERT INTO members (id, name) VALUES (?, ?)', [id, name]);
  return await getMemberById(id);
}

async function updateMember(id, name) {
  const pool = await initPool();
  await pool.query('UPDATE members SET name = ?, updated_at = NOW() WHERE id = ?', [name, id]);
  return await getMemberById(id);
}

async function deleteMember(id) {
  const pool = await initPool();
  await pool.query('DELETE FROM members WHERE id = ?', [id]);
}

// Loans (use transactions where appropriate)
async function getLoans() {
  const pool = await initPool();
  const [rows] = await pool.query('SELECT id, book_id AS bookId, member_id AS memberId, borrowed_at AS borrowedAt, returned_at AS returnedAt FROM loans');
  return rows;
}

async function getLoanById(id) {
  const pool = await initPool();
  const [rows] = await pool.query('SELECT id, book_id AS bookId, member_id AS memberId, borrowed_at AS borrowedAt, returned_at AS returnedAt FROM loans WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createLoan(bookId, memberId) {
  const pool = await initPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [bookRows] = await conn.query('SELECT id, available FROM books WHERE id = ? FOR UPDATE', [bookId]);
    if (!bookRows || bookRows.length === 0) {
      throw Object.assign(new Error('book not found'), { code: 'BOOK_NOT_FOUND' });
    }
    if (bookRows[0].available === 0) {
      throw Object.assign(new Error('book not available'), { code: 'BOOK_UNAVAILABLE' });
    }
    const [memberRows] = await conn.query('SELECT id FROM members WHERE id = ? FOR UPDATE', [memberId]);
    if (!memberRows || memberRows.length === 0) {
      throw Object.assign(new Error('member not found'), { code: 'MEMBER_NOT_FOUND' });
    }
    const id = uuidv4();
    await conn.query('INSERT INTO loans (id, book_id, member_id, borrowed_at) VALUES (?, ?, ?, NOW())', [id, bookId, memberId]);
    await conn.query('UPDATE books SET available = 0, updated_at = NOW() WHERE id = ?', [bookId]);
    await conn.commit();
    return await getLoanById(id);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function returnLoan(loanId) {
  const pool = await initPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [loanRows] = await conn.query('SELECT id, book_id, returned_at FROM loans WHERE id = ? FOR UPDATE', [loanId]);
    if (!loanRows || loanRows.length === 0) {
      throw Object.assign(new Error('loan not found'), { code: 'LOAN_NOT_FOUND' });
    }
    if (loanRows[0].returned_at) {
      throw Object.assign(new Error('already returned'), { code: 'ALREADY_RETURNED' });
    }
    const bookId = loanRows[0].book_id;
    await conn.query('UPDATE loans SET returned_at = NOW() WHERE id = ?', [loanId]);
    await conn.query('UPDATE books SET available = 1, updated_at = NOW() WHERE id = ?', [bookId]);
    await conn.commit();
    return await getLoanById(loanId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function deleteLoan(id) {
  const pool = await initPool();
  await pool.query('DELETE FROM loans WHERE id = ?', [id]);
}

module.exports = {
  // authors
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  // books
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  // members
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  // loans
  getLoans,
  getLoanById,
  createLoan,
  returnLoan,
  deleteLoan,
};
