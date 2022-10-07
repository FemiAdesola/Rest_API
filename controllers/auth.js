'use strict';
const { validationResult } = require('express-validator');
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
    const password= req.body.password;
}