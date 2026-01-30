
const { Sequelize } = require("sequelize");
const dbConfig = require("../config/database");

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: Number(process.env.DB_PORT || 3306),
    dialect: dbConfig.dialect,
    logging: false,
  }
);

const Book = require("./Book")(sequelize);
const BorrowLog = require("./BorrowLog")(sequelize);

// Relasi
Book.hasMany(BorrowLog, { foreignKey: "bookId" });
BorrowLog.belongsTo(Book, { foreignKey: "bookId" });

module.exports = {
  sequelize,
  Book,
  BorrowLog,
};
