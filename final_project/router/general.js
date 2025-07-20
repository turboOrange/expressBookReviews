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
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const book = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const result = books[req.params.isbn];
        result ? resolve(result) : reject(`Book with ISBN ${req.params.isbn} not found.`);
      }, 1000); // Simulate async delay
    });
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ error });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const matches = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const result = Object.values(books).filter(b => b.author === author);
        result.length ? resolve(result) : reject(`No books found for author “${author}”`);
      }, 1000);
    });
    return res.status(200).json(matches);
  } catch (error) {
    return res.status(404).json({ error });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const matches = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const result = Object.values(books).filter(b => b.title === title);
        result.length ? resolve(result) : reject(`No books found for title “${title}”`);
      }, 1000);
    });
    return res.status(200).json(matches);
  } catch (error) {
    return res.status(404).json({ error });
  }
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
