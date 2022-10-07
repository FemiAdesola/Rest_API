'use strict';
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// const fs = require('fs');
// const path = require('path');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    // error handling 
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed!.');
        error.data = error.array();
        error.statusCode = 422;
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