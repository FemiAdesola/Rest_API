'use strict';
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
    if (!errors.isEmpty()) {
        return res.status(422)
            .json({
                message: 'Validation failed, entered data is incorrect.',
                errors: errors.array()
            });
    }
    const title = req.body.title;
    const content = req.body.content;
    res.status(201).json({
            message: 'Post created successfully',
            post: {
                _id: new Date().toISOString(),
                title: title,
                content: content,
                creator: {
                        name:'Femi'
                    },
                createdAt: new Date()
            }
        });
};