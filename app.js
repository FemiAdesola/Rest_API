'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const mongoose = require('mongoose');

const feedRoutes = require('./routes/feed');

// for database
const MONGODB_URL = 'mongodb+srv://Femi:CwRbXZuHSUaMW9yH@shop.fftoabl.mongodb.net/messages';

const app = express();

// app.use(bodyParser.urlencoded()); // x-wwww-for.urlencoded <form>
app.use(bodyParser.json()); // application/json

// for serving image statically 
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type', 'Authorization');
    next();
});

app.use('/feed', feedRoutes);

// general error handling 500
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statuscode;
    const message = error.message;
    res.status(status).json({message:message});
});

// server connection with mongoose 
mongoose.connect(MONGODB_URL)
    .then(result => {
        app.listen(5050);
    })
    .catch(error => {
        console.log(error)
    });
