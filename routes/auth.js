'use strict';
const express = require('express');
const {body} = require('express-validator');

const User = require('../models/user'); 
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// signup 
router.put('/signup', [
    body('email').isEmail().withMessage('Please enter a valid email')
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
        'Please provides a password with at least 5 characteers'
    ).trim().isLength({min:5}),
    body('name').trim().not().isEmpty()
], authController.signup);

// login 
router.post('/login', authController.login);


// status
router.get('/status', isAuth, authController.getUserStatus);

router.patch(
  '/status',
  isAuth,
  [
    body('status')
      .trim()
      .not()
      .isEmpty()
  ],
  authController.updateUserStatus
);

module.exports = router;