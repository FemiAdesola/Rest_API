'use strict';
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// const fs = require('fs');
// const path = require('path');

const User = require('../models/user');
// const { Error } = require('mongoose');

// signup ----------------------------------------------------------------------
exports.signup = async(req, res, next) => {
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
    try {
        const hashPassword = await bcrypt.hash(password, 12)
        const user = new User({
            email: email,
            password: hashPassword,
            name: name
        });
        const result = await user.save();
        res.status(201).json({
            message: 'User created!',
            userId: result._id
        });
         
    } catch(error){
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    };
}

// Login-----------------------------------------------------------
exports.login = async(req, res, next) => { 
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            const error = new Error('A user with this email could not be found.');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isTheSame= await bcrypt.compare(password, user.password);
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
    } catch(error)  {
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    };
}



// -------------------get user status----------------------------------------
exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// -------------------updated user status----------------------------------------
exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({ message: 'User updated.' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};