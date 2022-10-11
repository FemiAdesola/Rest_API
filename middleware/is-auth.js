'use strict';
const jwt = require('jsonwebtoken');

// for protecting the pages 
module.exports = (req, res, next) => {
    // for get the header
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }
    //
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'somesupersecretsecret')
    } catch (error) {
        error.statusCode = 500;
        throw error;
    }
    if (!decodedToken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
};
