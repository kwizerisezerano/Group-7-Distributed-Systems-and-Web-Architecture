const express = require('express');
const morgan = require('morgan');
const booksRouter = require('./routes/books');
const authorsRouter = require('./routes/authors');
const membersRouter = require('./routes/members');
const loansRouter = require('./routes/loans');

const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Library API', links: { books: '/books', authors: '/authors', members: '/members', loans: '/loans' } });
});

app.use('/books', booksRouter);
app.use('/authors', authorsRouter);
app.use('/members', membersRouter);
app.use('/loans', loansRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Library API listening on port ${PORT}`));

module.exports = app;
