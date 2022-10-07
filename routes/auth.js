'use strict';
const express = require('express');
const {body} = require('express-validator');

const User = require('../models/user'); 
const authController = require('../controllers/auth');

const router = express.Router();

// signup 
router.put('/signup', [
    body('email').isEmail().withMessage('Please enter a nalid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('E-Mail exists already, please pick a different one.');
                    }
                });
     
        })
       .normalizeEmail(),
    body('password',
        'Please provides a password with only numbers and text and at least 5 characteers'
    ).trim().isLength({min:5}),
    body('name').trim().not().isEmpty()
], authController.signup);

// login 
router.post('/login', authController.login);

module.exports = router;