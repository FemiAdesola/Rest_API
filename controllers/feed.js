'use strict';
const Post = require('../models/post')
const { validationResult } = require('express-validator');

// get posts
exports.getPosts = (req, res, next) => {
    // fetch from dataabse
    Post.find()
        .then(posts => {
            res
                .status(200)
                .json({
                    message: 'Fetched posts successfully.',
                    posts: posts
                });
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }
            next(error);
        });
    // res
    //     .status(200)
    //     .json({
    //         posts: [
    //             {
    //                 _id:'1',
    //                 title: 'First Post',
    //                 content: 'This is the first post!',
    //                 imageUrl: 'images/cloth.jpg',
    //                 creator: {
    //                     name:'Femi'
    //                 },
    //                 createdAt: new Date()
    //             },
    //             {
    //                 _id:'2',
    //                 title: 'second Post',
    //                 content: 'This is the secodn post!',
    //                 imageUrl: 'images/laptop.jpeg',
    //                 creator: {
    //                     name:'Femi'
    //                 },
    //                 createdAt: new Date()
    //             },
    //             {
    //                 _id:'3',
    //                 title: 'Third Post',
    //                 content: 'This is the third post!',
    //                 imageUrl: 'images/book.jpeg',
    //                  creator: {
    //                     name:'Femi'
    //                 },
    //                 createdAt: new Date()
    //             }
    //         ]
    //     });
};


// create post 
exports.createPosts = (req, res, next) => {
    const errors = validationResult(req);
    // error handling 
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422;
        throw error;
    }
    // filestorage for image
    if (!req.file) {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }
    //

    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;

    // function to create post to database
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
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

// get post 
exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post=>{
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 400;
                throw error;
            }
            res.status(200).json({
                message: 'Post fetched',
                post: post
            })
        })
        .catch(error => {
            console.log('error in getpost code')
            next(error);
        });
}