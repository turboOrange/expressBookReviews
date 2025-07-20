const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  username = req.body.username
  password = req.body.password
  if (!username || !password) { return res.status(400).json({ error: 'Both username and password are required' }); }
  if (!isValid(username)) { return res.status(400).json({ error: 'Name already exists' }) }
  if (password.length < 5) { return res.status(400).json({ error: 'Weak password' }) }

  users.push({ username: username, password: password })
  return res.status(200).json({ message: "User registered" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
    }, 6000);
  }).then(booksFromPromise => {
    return res.status(200).json(booksFromPromise);
  }).catch(err => {
    return res.status(500).json({ message: "Something went wrong" });
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ error: `Book with ISBN ${req.params.isbn} not found.` });
  }
  return res.status(200).json(book);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matches = Object.values(books).filter(b => b.author === author);
  if (matches.length === 0) {
    return res.status(404).json({ error: `No books found for author “${author}”` });
  }
  return res.status(200).json(matches);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matches = Object.values(books).filter(b => b.title === title);
  if (matches.length === 0) {
    return res.status(404).json({ error: `No books found for title “${title}”` });
  }
  return res.status(200).json(matches);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ error: `Book with ISBN ${req.params.isbn} not found.` });
  }
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
