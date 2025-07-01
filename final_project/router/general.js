const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if(!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if(!isValid(username)) {
    return res.status(409).json({message: "Username already exists"});
  }

  // Create new user
  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    username: username,
    password: password,
  };

  users.push(newUser);
  
  return res.status(201).json({
    message: "User registered successfully",
    user: { id: newUser.id, username: newUser.username }
  });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  if(!books || Object.keys(books).length === 0) {
    return res.status(404).json({message: "No books found"});
  }

  return res.status(200).json({
    message: "Books fetched successfully",
    data: books
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const bookDetails = books[isbn];

  if(!bookDetails) {
    return res.status(404).json({message: "Book not found"});
  }

  return res.status(200).json({
    message: "Book details fetched successfully", 
    data: bookDetails
  });
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  if(!author) {
    return res.status(400).json({message: "Author parameter is required"});
  }

  // Find all books by the specified author
  const booksByAuthor = Object.keys(books)
    .filter(isbn => books[isbn].author.toLowerCase() === author.toLowerCase())
    .map(isbn => ({ isbn, ...books[isbn] }));
  
  if (booksByAuthor.length === 0) {
    return res.status(404).json({message: "No books found by this author"});
  }

  return res.status(200).json({
    message: "Books by author fetched successfully",
    data: booksByAuthor
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  if(!title) {
    return res.status(400).json({message: "Title parameter is required"});
  }

  const booksByTitle = Object.keys(books)
    .filter(isbn => books[isbn].title.toLowerCase().includes(title.toLowerCase()))
    .map(isbn => ({ isbn, ...books[isbn] }));
  
  if (booksByTitle.length === 0) {
    return res.status(404).json({message: "No books found with this title"});
  }

  return res.status(200).json({
    message: "Books by title fetched successfully",
    data: booksByTitle
  });
});

// Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if(!isbn) {
    return res.status(400).json({message: "ISBN parameter is required"});
  }
  
  const foundBook = books[isbn];

  if(!foundBook) {
    return res.status(404).json({message: "Book not found"});
  }

  // Check if book has reviews
  if (!foundBook.reviews || Object.keys(foundBook.reviews).length === 0) {
    return res.status(404).json({message: "No reviews found for this book"});
  }

  return res.status(200).json({
    message: "Book reviews fetched successfully",
    data: {
      isbn: isbn,
      title: foundBook.title,
      reviews: foundBook.reviews
    }
  });
});

module.exports.general = public_users;
