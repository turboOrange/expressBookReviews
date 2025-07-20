const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return !users.some(u => u.username === username);
}


const authenticatedUser = (username, password) => { //returns boolean
  return users.some(u => u.username === username && u.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Bad username or password" });
  }

  const payload = { username };
  const secret = process.env.JWT_SECRET || "secret";

  const token = jwt.sign(payload, secret, {
    expiresIn: "1h",
    issuer: "localhost"
  });

  return res.status(200).json({ token });
});

// Add a book review
regd_users.put("/review/:isbn", (req, res) => {
  const token = req.body.token;
  const isbn = req.params.isbn;
  const review = req.body.review;
  if (!token) { return res.status(400).json({ message: "Missing token" }); }
  let username;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    username = decoded.username;
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  if (!isbn) { return res.status(400).json({ message: "No ISBN provided" }); }
  if (!review) { return res.status(400).json({ message: "No review provided" }); }
  if (!books[isbn]) { return res.status(404).json({ message: "Book not found" }); }
  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added or updated" });
});

regd_users.delete("/review/:isbn", (req, res) => {
  const token = req.body.token;
  const isbn = req.params.isbn;
  if (!token) { return res.status(400).json({ message: "Missing token" }); }
  let username;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    username = decoded.username;
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  if (!isbn) { return res.status(400).json({ message: "No ISBN provided" }); }
  if (!books[isbn]) { return res.status(404).json({ message: "Book not found" }); }
  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
