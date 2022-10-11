'use strict';
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// const fs = require('fs');
// const path = require('path');

const User = require('../models/user');
// const { Error } = require('mongoose');

// signup 
exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    // error handling 
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed!.');
        error.statusCode = 422;
        error.data = error.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    
    // for hash the password
        bcrypt
            .hash(password, 12)
            .then(hashPassword => {
                const user = new User({
                    email: email,
                    password: hashPassword,
                    name: name
                });
                return user.save();
            })
            .then(result => {
                res.status(201).json({
                    message: 'User created!',
                    userId: result._id
                });
            })
            .catch(error => {
                if(!error.statusCode){
                error.statusCode = 500;
                }
                next(error);
            });
}

// Login
exports.login = (req, res, next) => { 
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                const error = new Error('A user with this email could not be found.');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isTheSame => {
            if (!isTheSame) {
                const error = new Error('Wrong Password');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign(
                {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
                },
                'somesupersecretsecret',
                { expiresIn: '1h' }
            );
            res.status(200).json({
                token: token,
                userId: loadedUser._id.toString()
            });
        })
        .catch(error => {
                if(!error.statusCode){
                error.statusCode = 500;
                }
                next(error);
            });
}
