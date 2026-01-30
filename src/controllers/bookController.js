const { Book } = require("../models");

function isEmpty(str) {
  return !str || String(str).trim() === "";
}

// PUBLIC: GET /api/books
async function getAllBooks(req, res, next) {
  try {
    const books = await Book.findAll();
    res.json({ data: books });
  } catch (err) {
    next(err);
  }
}

// PUBLIC: GET /api/books/:id
async function getBookById(req, res, next) {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ data: book });
  } catch (err) {
    next(err);
  }
}

// ADMIN: POST /api/books
async function createBook(req, res, next) {
  try {
    const { title, author, stock } = req.body;

    if (isEmpty(title)) return res.status(400).json({ message: "title tidak boleh kosong" });
    if (isEmpty(author)) return res.status(400).json({ message: "author tidak boleh kosong" });

    const stockNum = stock === undefined ? 0 : Number(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ message: "stock harus angka >= 0" });
    }

    const newBook = await Book.create({ title: title.trim(), author: author.trim(), stock: stockNum });
    res.status(201).json({ message: "Book created", data: newBook });
  } catch (err) {
    next(err);
  }
}

// ADMIN: PUT /api/books/:id
async function updateBook(req, res, next) {
  try {
    const { title, author, stock } = req.body;
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (title !== undefined && isEmpty(title)) return res.status(400).json({ message: "title tidak boleh kosong" });
    if (author !== undefined && isEmpty(author)) return res.status(400).json({ message: "author tidak boleh kosong" });

    if (stock !== undefined) {
      const stockNum = Number(stock);
      if (isNaN(stockNum) || stockNum < 0) return res.status(400).json({ message: "stock harus angka >= 0" });
      book.stock = stockNum;
    }

    if (title !== undefined) book.title = title.trim();
    if (author !== undefined) book.author = author.trim();

    await book.save();
    res.json({ message: "Book updated", data: book });
  } catch (err) {
    next(err);
  }
}

// ADMIN: DELETE /api/books/:id
async function deleteBook(req, res, next) {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    await book.destroy();
    res.json({ message: "Book deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};

