const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

//json web tokens functions
const SECRET = "jwt_secret";

function generateToken(payload){
  return jwt.sign(payload, SECRET, {expiresIn: '1h'});
}

function verifyToken(token){
  return jwt.verify(token, SECRET);
}

const isValid = (username)=>{ //returns boolean
  const existingUser = users.find(u => u.username === username);
  return !existingUser; // Return true if username is available (valid for registration)
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const user = users.find(u => u.username === username && u.password === password);
  return user ? true : false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;

  if(!username || !password){
    return res.status(400).json({message: "Username and password are required"});
  }

  const user = users.find(u => u.username === username && u.password === password);

  if(!user) {
    return res.status(401).json({message: 'Invalid username or password'});
  }

  // Generate JWT token for authenticated user
  const token = generateToken({username: user.username, id: user.id});

  // Store token in session
  req.session.authorization = {
    accessToken: token,
    username: username
  };

  return res.status(200).json({
    message: "User logged in successfully", 
    token: token
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization?.username;

  // Validate input
  if(!review) {
    return res.status(400).json({message: "Review content is required"});
  }

  if(!username) {
    return res.status(401).json({message: "User not authenticated"});
  }
    
  if(!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }

  if(!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;


  return res.status(200).json({
    message: "Book review updated successfully", 
    book: books[isbn]
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.generateToken = generateToken;
module.exports.verifyToken = verifyToken;