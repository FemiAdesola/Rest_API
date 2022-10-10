'use strict';
const Post = require('../models/post')
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// get posts
exports.getPosts = (req, res, next) => {
 // for pagination 
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
     
    Post.find()
        .countDocuments()
        .then(count => {
        totalItems = count;
        return Post.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage);
        })
    //

        // fetch from dataabse
        .then(posts => {
            res
                .status(200)
                .json({
                    message: 'Fetched posts successfully.',
                    posts: posts,
                    totalItems:totalItems
                });
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }
            next(error);
        });
};


// create post 
exports.createPost = (req, res, next) => {
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

// Update post 
exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    // error handling 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        const error = new Error('No file picked.');
        error.statusCode = 422;
        throw error;
    }
    // after checking value we can update by the code below
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            // clear image
            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }
            //
            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content;
            return post.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Post updated!',
                post: result
            })
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }
            next(error);
        })
};

// deletePost
exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            // to check if the post undefined
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            // check looged in user later
            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postId);
        })
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Post deleted!'
            });
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            };
            next(error);
        });
};

// for clear image
const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, error => console.error(error));
}