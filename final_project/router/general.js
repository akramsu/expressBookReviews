const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and Password required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        resolve(books);
      });
    };
    const result = await getBooks();
    return res.status(200).send(JSON.stringify(result, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Async-Await version with Axios
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books", error: error.message });
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here
  try {
    const isbn = req.params.isbn;
    const getBookByISBN = () => {
      return new Promise((resolve, reject) => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject("Book not found");
        }
      });
    };
    const result = await getBookByISBN();
    return res.status(200).send(JSON.stringify(result, null, 4));
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});

// Async-Await version with Axios
public_users.get('/async/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    res.send(response.data);
  } catch (error) {
    res.status(404).json({ message: "Book not found", error: error.message });
  }
});


// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  //Write your code here
  try {
    const author = req.params.author;
    const getBooksByAuthor = () => {
      return new Promise((resolve, reject) => {
        const result = Object.values(books).filter(book => book.author === author);
        if (result.length > 0) {
          resolve(result);
        } else {
          reject("No books found for this author");
        }
      });
    };
    const result = await getBooksByAuthor();
    return res.status(200).send(JSON.stringify(result, null, 4));
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});

// Async-Await version with Axios
public_users.get('/async/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    res.send(response.data);
  } catch (error) {
    res.status(404).json({ message: "Author not found", error: error.message });
  }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  try {
    const title = req.params.title;
    const getBooksByTitle = () => {
      return new Promise((resolve, reject) => {
        const result = Object.values(books).filter(book => book.title === title);
        if (result.length > 0) {
          resolve(result);
        } else {
          reject("No books found with this title");
        }
      });
    };
    const result = await getBooksByTitle();
    return res.status(200).send(JSON.stringify(result, null, 4));
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});


// Async-Await version with Axios
public_users.get('/async/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    res.send(response.data);
  } catch (error) {
    res.status(404).json({ message: "Title not found", error: error.message });
  }
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;