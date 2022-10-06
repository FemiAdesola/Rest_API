'use strict';
const Post = require('../models/post')
const {validationResult}=require('express-validator')
exports.getPosts = (req, res, next) => {
    res
        .status(200)
        .json({
            posts: [
                {
                    _id:'1',
                    title: 'First Post',
                    content: 'This is the first post!',
                    imageUrl: 'images/cloth.jpg',
                    creator: {
                        name:'Femi'
                    },
                    createdAt: new Date()
                },
                {
                    _id:'2',
                    title: 'second Post',
                    content: 'This is the secodn post!',
                    imageUrl: 'images/laptop.jpeg',
                    creator: {
                        name:'Femi'
                    },
                    createdAt: new Date()
                },
                {
                    _id:'3',
                    title: 'Third Post',
                    content: 'This is the third post!',
                    imageUrl: 'images/book.jpeg',
                     creator: {
                        name:'Femi'
                    },
                    createdAt: new Date()
                }
            ]
        });
};

exports.createPosts = (req, res, next) => {
    const errors = validationResult(req);
    // error handling 
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    // database
    const post = new Post({
        title: title,
        content: content,
        imageUrl: 'images/book.jpeg',
        creator: {name:'Femi'},
    });
    post.save()
        .then(result => {
            console.log(result)
            res.status(201).json({
            message: 'Post created successfully',
            post: result
        });
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }
            next(error);
        });
    //
};