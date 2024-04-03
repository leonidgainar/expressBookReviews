const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
    username: "user1",
    password: "password1"
}];

const isValid = (username) => { //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => { //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const { username } = req.user;

    const bookKeys = Object.keys(books);
    let existingReviewIndex = -1;

    for (let i = 0; i < bookKeys.length; i++) {
        const key = bookKeys[i];
        if (books[key].reviews && books[key].reviews[username] !== undefined) {
            existingReviewIndex = parseInt(key);
            break;
        }
    }

    if (existingReviewIndex !== -1) {
        books[existingReviewIndex].reviews[username] = review;
    } else {
        if (books[isbn]) {
            if (!books[isbn].reviews) {
                books[isbn].reviews = {};
            }
            books[isbn].reviews[username] = review;
        } else {
            books[isbn] = { reviews: { [username]: review } };
        }
    }

    return res.status(200).json({ message: "Review added successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { username } = req.user;

    if (!books[isbn] || !books[isbn].reviews) {
        return res.status(404).json({ message: "Review not found" });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
