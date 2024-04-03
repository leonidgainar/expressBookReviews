const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users.includes(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push(username);
    
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const filteredBooks = [];

    Object.keys(books).forEach(key => {
        const book = books[key];
        if (key === isbn) {
            filteredBooks.push(book);
        }
    });

    if (filteredBooks.length === 0) {
        return res.status(404).json({ message: "No books found for this isbn" });
    }

    return res.status(200).json(filteredBooks);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const filteredBooks = [];

    Object.keys(books).forEach(key => {
        const book = books[key];
        if (book.author === author) {
            filteredBooks.push(book);
        }
    });

    if (filteredBooks.length === 0) {
        return res.status(404).json({ message: "No books found for this author" });
    }

    return res.status(200).json(filteredBooks);
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const filteredBooks = [];

    console.log(title)

    Object.keys(books).forEach(key => {
        const book = books[key];
        if (book.title === title) {
            filteredBooks.push(book);
        }
    });

    if (filteredBooks.length === 0) {
        return res.status(404).json({ message: "No books found for this title" });
    }

    return res.status(200).json(filteredBooks);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    let book;
    for (const key in books) {
        if (key === isbn) {
            book = books[key];
            break;
        }
    }

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    const reviews = book.reviews;

    return res.status(200).json({ reviews });
});

module.exports.general = public_users;
