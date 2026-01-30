function getRole(req) {
  return (req.headers["x-user-role"] || req.headers["x-userrole"] || "").toLowerCase();
}

function requireAdmin(req, res, next) {
  const role = getRole(req);
  if (role !== "admin") {
    return res.status(403).json({ message: "Forbidden: admin only (header x-user-role: admin)" });
  }
  next();
}

function requireUser(req, res, next) {
  const role = getRole(req);
  const userId = req.headers["x-user-id"];

  if (role !== "user") {
    return res.status(403).json({ message: "Forbidden: user only (header x-user-role: user)" });
  }
  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ message: "Bad Request: header x-user-id wajib angka" });
  }

  req.userId = Number(userId);
  next();
}

module.exports = {
  requireAdmin,
  requireUser,
};

