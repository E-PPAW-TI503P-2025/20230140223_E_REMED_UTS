const { sequelize, Book, BorrowLog } = require("../models");

// ADMIN (opsional): GET /api/borrow/logs
// Query opsional: ?userId=1&bookId=2&limit=50
async function getBorrowLogs(req, res, next) {
  try {
    const { userId, bookId, limit } = req.query;

    const where = {};
    if (userId !== undefined && userId !== "") {
      const userIdNum = Number(userId);
      if (isNaN(userIdNum)) return res.status(400).json({ message: "userId harus angka" });
      where.userId = userIdNum;
    }

    if (bookId !== undefined && bookId !== "") {
      const bookIdNum = Number(bookId);
      if (isNaN(bookIdNum)) return res.status(400).json({ message: "bookId harus angka" });
      where.bookId = bookIdNum;
    }

    const limitNum = limit === undefined || limit === "" ? 100 : Number(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      return res.status(400).json({ message: "limit harus angka > 0" });
    }

    const logs = await BorrowLog.findAll({
      where,
      include: [
        {
          model: Book,
          attributes: ["id", "title", "author"],
        },
      ],
      order: [["borrowDate", "DESC"]],
      limit: Math.min(limitNum, 500),
    });

    res.json({ data: logs });
  } catch (err) {
    next(err);
  }
}

// USER: POST /api/borrow
async function borrowBook(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const userId = req.userId;
    const { bookId, latitude, longitude } = req.body;

    if (!bookId || isNaN(Number(bookId))) {
      await t.rollback();
      return res.status(400).json({ message: "bookId wajib angka" });
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      await t.rollback();
      return res.status(400).json({ message: "latitude & longitude wajib angka" });
    }
    
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      await t.rollback();
      return res.status(400).json({ message: "Koordinat tidak valid (range lat/lon)" });
    }

    const book = await Book.findByPk(bookId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!book) {
      await t.rollback();
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.stock <= 0) {
      await t.rollback();
      return res.status(400).json({ message: "Stock buku habis" });
    }

    book.stock = book.stock - 1;
    await book.save({ transaction: t });

    const log = await BorrowLog.create(
      {
        userId,
        bookId: Number(bookId),
        latitude: lat,
        longitude: lon,
        borrowDate: new Date(),
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({
      message: "Borrow success",
      data: {
        borrowLog: log,
        bookAfter: { id: book.id, title: book.title, stock: book.stock },
      },
    });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

module.exports = {
  borrowBook,
  getBorrowLogs,
};

