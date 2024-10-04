exports.get404 = (req, res, next) => {
  res.status(404).json({ error: "Error 404 Page Not Found" });
};

exports.get500 = (req, res, next) => {
  res.status(500).json({ error: "Error 500 Internal Server Error" });
};