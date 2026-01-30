const express = require("express");
const morgan = require("morgan");
const path = require("path");

const bookRoutes = require("./routes/bookRoutes");
const borrowRoutes = require("./routes/borrowRoutes");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/books", bookRoutes);
app.use("/api/borrow", borrowRoutes);

app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

module.exports = app;
